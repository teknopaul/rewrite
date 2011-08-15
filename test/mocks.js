


request = function(data, url) {
	this.data = data;
	this.url = url;
	this.on = function(evt, cb) {
		if (evt == 'data') {
			cb(data);
		}
		else if (evt == 'end') {
			cb();
		}
	};
};

response = function() {
	var self = this;
	
	this.statusCode = 200;
	this.headers = {};
	
	this.setHeader = function(name, val) {
		//console.log("header set  " + name + ' : ' + val);
		self.headers[name] = val;
	};
	
	this.write = function(data){
		console.log(data);
	};
	

	this.writeHead = function(code, text, headers) {
		self.statusCode = code;
		for (header in headers) {
			self.headers[header] = headers[header];
		}
		console.log(code + " " + text);
		for (header in headers) {
			console.log( header + " : " + self.headers[header]);
		}
		console.log("");
	};
	
	this.end = function(){} ;
};

url = function(url)  {
	this.pathname = url || '/';
};

exports.request = request;
exports.response = response;
exports.url = url;
