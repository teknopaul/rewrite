var assert = require('assert');

var rewrite = require('../lib/rewrite.js');
var mocks = require('./mocks.js');

var request = null, response = null;

console.log("TEST Match");

rewrite.setRules( [
                     {regex : '^(/app/)$', 
                    	 replace : '$1appended', flags : ['L']} ,
                     
                     ] );

request = new mocks.request(null, "/app/");

rewrite.filter(request, new mocks.response(), false);
assert.equal(request.url, '/app/appended');

console.log("TEST Redirect");

rewrite.setRules( [
                     {regex : '^(.*)$', 
                    	 replace : '$1appended', flags : "R=302,L"} ,
                     
                     ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(response.headers['Location'], 	'/app/appended');
assert.equal(response.statusCode, 			302);


request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.configure({base : 'http://example.com'})
rewrite.filter(request, response, false);
assert.equal(response.headers['Location'], 	'http://example.com/app/appended');
assert.equal(response.statusCode, 			302);




console.log("TEST Cookies");

rewrite.setRules( [
                 {regex : '^/app/$', 
                   	 replace : '', flags : "CO=name=value;path=/"} ,
                 
                 ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(response.headers['Set-Cookie'], "name=value;path=/");
assert.equal(request.url, 			'/app/');



console.log("\nTEST Forbidden");

rewrite.setRules( [
                 {regex : '^/app/$', 
                   	 replace : '', flags : "F"} ,
                 
                 ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(response.statusCode, 403);
assert.equal(request.url, '/app/');



console.log("\nTEST Gone");

rewrite.setRules( [
                 {regex : '^/app/$', 
                   	 replace : '', flags : "G"} ,
                 
                 ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(response.statusCode, 410);
assert.equal(request.url, '/app/');


console.log("\nTEST No Case");

rewrite.setRules( [
                 {regex : '^/APP/$', 
                   	 replace : '/app/', flags : "NC"} ,
                 
                 ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(response.statusCode, 200);
assert.equal(request.url, '/app/');



console.log("\nTEST Multiple");

rewrite.setRules( [
                 {regex : '^/app/$', 
                   	 replace : '/app/appended', flags : null} ,
                 {regex : '^/app/appended$', 
                   	 replace : '/changedagain/', flags : "L"} ,
                 
                 ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(request.url, '/changedagain/');



console.log("\nTEST Last");

rewrite.setRules( [
                 {regex : '^/app/$', 
                   	 replace : '/app/appended', flags : "L"} ,
                 {regex : '^/app/appended$', 
                   	 replace : '/changedagain/', flags : "L"} ,
                 
                 ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(request.url, '/app/appended');



console.log("\nTEST Skip");

rewrite.setRules( [
                 {regex : '^/app/$', 
                   	 replace : '/app/appended', flags : null} ,
                 {regex : '^/app/$', 
                   	 replace : '/app/', flags : "S=1"} ,
                 {regex : '^/app/$', 
                   	 replace : 'shouldntgether', flags : "L"} ,
                 {regex : '^/app/appended$', 
                   	 replace : '/changedagain/', flags : "L"} ,
                 
                 ] );

request = new mocks.request(null, "/app/");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(request.url, '/changedagain/');



console.log("\nTEST Mime");

rewrite.setRules( [
                 {regex : '^/img/.*\.png$', 
                   	 replace : '/dontreplace', flags : "T=image/png"} ,
                 
                 ] );

request = new mocks.request(null, "/img/blank.png");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(response.headers['Content-Type'], 'image/png');
assert.equal(request.url, '/img/blank.png');


console.log("\nTEST Replace all hacks");

rewrite.setRules( [
                 {regex : /\\/g, 
                   	 replace : '/', flags : null} ,
                 ] );

request = new mocks.request(null, "\\microsoft\\sux\\");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(request.url, '/microsoft/sux/');


console.log("\nTEST no flags");

rewrite.setRules( [
                 {regex : /\\/g, replace : '/'} ,
                 ] );

request = new mocks.request(null, "\\microsoft\\sux\\");
response = new mocks.response();
rewrite.filter(request, response, false);
assert.equal(request.url, '/microsoft/sux/');


