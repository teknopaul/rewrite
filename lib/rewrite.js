/**
 *  mod_rewrite for node, heavily based on Apache2 mod_rewrite but very much NOT the same.
 *  
 *  @see http://httpd.apache.org/docs/2.0/mod/mod_rewrite.html
 *  
 *  It can be used in two ways as a filter chain or just by calling filter(request, response, false)
 *  
 *  This modules just accepts regexs written outside this class and applies them to the contents of request.url
 *  
 *  Thus some things must be dealt with by the rule writer that Apache would do for you handle
 *   Encoding and escaping.
 *   Query string handling.
 *   POSTs with form URLs have some parameters that are not stored in request.url
 * 
 * There are likley differences between Apache's regexes and JavaScripts regex's.
 *  
 *  This engine does not have any connection to the "container" as such, 
 *   so it is not possible to thing Apache does like return a 403 and then get the error page HTML configured for a
 *   403 and display a nice message.  
 *  Thus, redirects and forbid just return the HTTP code and stop the request.  
 *  If you want to add your own error pages set config.continueOnError and implement as a filter chain write to 
 *  the body and it is your responsibility to call response.end()
 *  
 *  Supported flags
 *  L = Last
 *  F = Forbidden
 *  G = Gone
 *  N = Next (Be careful not to create an infinite loop!)
 *  R = Redirect
 *  S = Skip
 *  T = set mime type
 *  NC = case insensitive regex
 *  CO = cookie the cookie stirng is not parsed for : like Apache does.
 *  	 	what ever comes after the = is added in a Set-Cookie header 
 *  		CO=visitedCheckout=true;path=/;domain=;secure=true;httponly=true
 *  
 *  
 *  The gothcas
 *  
 *    'C' Chain is not implemented
 *    'R' redirects immediately no need to L no option to continue
 *    'PT' Pass-through makes no sense in this context
 *    'NS' No subrequest makes no sense in this context
 *    'P' Proxy is not implemented, I supose we could
 *    'E' Env is not implemented
 *    'NE' no escape is not implemented
 *    'QSA' querys string append is not implemented
 *    
 *    We dont know the URL used to make the request we could read Host: header but we would have to guess http or https
 *    so 302 redirects can't add the protocol and host, you can set a static value by setting the configuration value config.base
 *    
 */
var parse = require('url').parse;

////// Module local variables //////  
var config = {
		base : "",
		protocol : 'http:',
		continueOnError : false
};

var rules = [];

/**
 * Rules take 3 args
 * @param regex a String defining the regular expression
 * @param replace the replacement text
 * @param an array of strings similar to Apache syntax but actually an array 
 * 	e.g ['NC', 'L']
 * 
 * an example Rule
 * 
 */
function RewriteRule(regex, replace, flags) {
	
	this.regex = new RegExp( regex );
	this.replace = replace;
	this.flags = flags;
	
	if (flags && flags.length) {
		for (var i = 0; i < this.flags.length; i++) {
			var flag = this.flags[i].split('=');
			switch (flag[0]) {
				case 'L':
					this.last = true;
					break;
				case 'F':
					this.forbidden = true;
					break;
				case 'G':
					this.gone = true;
					break;
				case 'N':
					this.next = true;
					break;
				case 'R':
					if (flag.length > 1) {
						this.redirect = parseInt(flag[1]);
					}
					else {
						this.redirect = 302;
					}
					break;
				case 'S':
					this.skip = parseInt(flag[1]);
					break;
				case 'T':
					this.mime = flag[1];
					break;
				case 'CO':
					this.cookie = buildCookie(flag);
					break;
				case 'NC':
					this.regex = new RegExp( regex, "i" );
					break;
				case '':
					break;
		
				default:
					console.log("Unknown rewrite flag:" + flag);
			}
		}
	}
	// console.dir(this);
	
	buildCookie = function(arr) {
		sb = '';
		for (var i = 1; i < arr.length; i++) {
			if (i > 1) sb += '=';
			sb += arr[i];
		}
		return sb;
	};
};


/**
 * Set or overwrite the Config.
 */
configure = function(newConfig) {
	config = newConfig;
};

/**
 * Set or overwrite the RewriteRules
 */
setRules = function(json) {
	if (typeof json == 'string') {
		json = JSON.parse(json);
	}
	
	var newRules = new Array();
	
	for (var i = 0; i < json.length; i++) {
		var jRule = json[i];
		if (typeof jRule == 'string') {
			var parts = jRule.split('\t');
			if (parts.length != 3) {
				parts = jRule.split(' ');
				if (parts.length != 3) {
					throw new Error('invalid rewrite format "' + jRule + '"');
				}
			}
			jRule = {
					regex : parts[0],
					replace : parts[1],
					flags : parts[2]
			};
		}
		if (typeof jRule.flags == 'string') {
			jRule.flags = jRule.flags.split(',');
		}
		var rule = new RewriteRule(jRule.regex, jRule.replace, jRule.flags);
		newRules.push(rule);
	}
	rules = newRules;// TODO if this does Compare and Swap we could support SIGHUP and reload the rules.
};


/**
 * do the rewriting output is put back into request.url or a response is send directly
 */
rewrite = function(url, request, response) {
	try {

		var rewritten =  url;
		
		for (var i = 0; i < rules.length; i++) {
			
			var rule = rules[i];
			// match
			//console.log("testing " + rewritten);
			if ( rule.regex.test(rewritten) ) {
				
				//console.log("Match! " + url);
				
				if(rule.gone) {
					gone(response);
					return false;
				}
				else if(rule.forbidden) {
					forbidden(response);
					return false;
				}
				else if(rule.skip > 0) {
					i += rule.skip;
					continue;
				}
				else if(typeof rule.mime != 'undefined') {
					response.setHeader("Content-Type",  rule.mime);
					continue;
				}
				else if(typeof rule.cookie != 'undefined') {
					response.setHeader("Set-Cookie",  rule.cookie);
					continue;
				}
				
				// rewrite
				rewritten =  rewritten.replace(rule.regex, rule.replace);
				request.url = rewritten;
				
				//console.log("rewritten = " + rewritten);
				
				if (rule.next) {
					return rewrite(rewritten, request, response);
				}
				else if (rule.redirect > 0) {
					moved(response, rule.redirect,  config.base + rewritten);
					return false;
				}
				else if (rule.last) {
					return true;
				}
			}
		}
		return true;
	}
	catch(err) {
		console.log("rewrite error: " + err);
		return 500;
	}
};

/// Not very nice error messages ///
function serverError(response) {
	response.writeHead(500, "SERVER ERROR");
	if ( ! config.continueOnError ) { 
		response.end();
	}
};
function gone(response) {
	response.writeHead(410, "GONE");
	if ( ! config.continueOnError ) { 
		response.end();
	}
};
function forbidden(response) {
	response.writeHead(403, "FORBIDDEN");
	if ( ! config.continueOnError ) { 
		response.end();
	}
};
function moved(response, code, location) {
	response.writeHead(code, "MOVED", {'Location' : location});
	if ( ! config.continueOnError ) { 
		response.end();
	}
};
/**
 *  Log filter as an example filter
 */ 
filter = function(request, response, chain) {
	// pre code
	var url = request.url;
	// TODO var url = parse(request.url, true);
	
	var cont = rewrite(url, request, response);
	
	// chain
	if (config.continueOnError || (cont && chain) ) {
		chain.doFilter(request, response);
		return true;
	}
	else {
		return false;
	}
	// post code
};

module.exports.configure = configure;
module.exports.filter = filter;
module.exports.setRules = setRules;

module.exports.config = config;
module.exports.rules = rules;
