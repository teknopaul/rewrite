URL rewriting for node, heavily based on Apache2 mod_rewrite but very much NOT the same.

http://httpd.apache.org/docs/2.0/mod/mod_rewrite.html

It can be used in two ways as a filter-chain (see http://github.com/teknopaul/filter-chain) 
or just by calling 
    filter(request, response, false) 
the request.url attribute is modified, and potentially the response is modified or even committed.

This modules accepts regexs written outside this class and applies them to the contents of request.url.

Thus some things must be dealt with by the rule writer that Apache would do for you.
* Encoding and escaping.
* Query string handling.
* POSTs with form URLs have some parameters that are not stored in request.url

There are likely differences between Apache's regexs and JavaScript's regexs.

This engine does not have any connection to the "container" as such, 
 so it is not possible to thing Apache does like return a 403 and then get the error page HTML configured for a
 403 and display a nice message.  
Thus, redirects and forbid just return the HTTP code and stop the request.  
If you want to add your own error pages set config.continueOnError and implement as a filter chain write to 
the body and then it is your responsibility to call response.end()

### defining rules

Rules are defined in a JSON Array and passed to rewrite.parseRules() Either a JSON string or an array of objects is accepted.

e.g.
    rewrite.setRules( [
                        {regex : '^(/app/)$', 
                         replace : '$1appended', 
                         flags : ['L']} ,
                        ] );

### Supported flags

* L = Last
* F = Forbidden
* G = Gone
* N = Next (Be careful not to create an infinite loop!)
* R = Redirect
* S = Skip
* T = set mime type
* NC = case insensitive regex
* CO = cookie the cookie stirng is not parsed for : like Apache does.
	 	what ever comes after the = is added in a Set-Cookie header 
		CO=visitedCheckout=true;path=/;domain=;secure=true;httponly=true

### The gothcas

*  'C' Chain is not implemented
*  'R' redirects immediately no need to use 'L' no option to continue
*  'PT' Pass-through makes no sense in this context
*  'NS' No subrequest makes no sense in this context
*  'P' Proxy is not implemented, I supose we could
*  'E' Env is not implemented
*  'NE' no escape is not implemented
*  'QSA' querys string append is not implemented
  
 We don't know the URL used to make the request we could read Host: header but we would have to guess http or https
 so 302 redirects can't add the protocol and host, you can set a static value by setting the configuration value config.base
 
 