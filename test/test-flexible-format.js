
var rewrite = require('../lib/rewrite.js');
var test = require('nodeunit');
/**
 * The parser accepts some restricted shortcuts formats for the regexs
 * 
 * Flags
 * =====
 * 
 * flags can be provided as a list of strings or a comma separated list.
 * 
 * 'L,NC' is  more convenient than ['L', 'NC']
 * 
 * You can't use the comma separated list if the flag contains a comma
 * 
 *   e.g. this is wrong   
 *    {regex : '^(.*)$', replace : '$1', flags : 'L,CO=types=a,b,c;path=/' }
 * 
 * The flags parser just does a split() on the value and gets confused.  If you have commas in the flags use the full array format
 * 
 *    {regex : '^(.*)$', replace : '$1', flags : ['L', 'CO=types=a,b,c;path=/'] }
 * 
 * 
 * 
 * One String
 * ==========
 * 
 * Provided that the regex and the replace have no spaces in them, a single string can be provided with ONE space to delimit the parts
 * 
 *    "^/app/(.*)$ /newt/$1 L"
 * 
 * or ONE tab (spaces and tabs can not be mixed)
 * 
 *    "^/app/(.*)$	/newt/$1		L"
 *   
 * again split() is done so if the regex has spaces it gets confused
 * 
 *   e.g. this is wrong, wierd stuff happens
 *    "^/app/(.*)$ /newt and salamander/$1 L"
 * 
 * RegExp Objects
 * ==============
 *    
 * You can also provide a pre-created JavaScript regex object, this is handy for escaping issues which are typical with regexes.
 * N.B.  clearly this does not work in a JSON file it only works in JavaScript source code
 *  
 *    {regex : /\\/g, replace : '/', flags : 'NC,L'}
 *    
 * is identical to following quadrupal escape, which is clearly ugly
 * 
 *    {regex : "/\\\\/g", replace : '/', flags : 'NC,L'}
 * 
 * This also works
 * 
 *    {regex : new RegExp("/\\\\/g", 'i'), replace : '/', flags : 'L'}
 * 
 * Dropping the flags
 * ==================
 * 
 * N.B.  flags are not always needed and can be null empty or undefined
 * 
 *    {regex : /\\/g, replace : '/', flags : null}
 *    {regex : /\\/g, replace : '/', flags : []}
 *    {regex : /\\/g, replace : '/'}
 * 
 * But annoyingly (I might fix this) when delimiting with whitespace you still need three parts so you need a trailng space or tab
 * 
 *     "^(.*)$	$1	"
 *  
 *  
 *  
 *  The idea of all this is so that you can create rules generally with a single string
 *  
 *      "^(.*)$ $1 F,L"
 *  
 *  but when JavaScript or regex escaping create problems we can revert the more precise means of specifying the config.
 *  
 *  
 *  N.B. it is perfectly possible to create rule sets that make infinite loops
 *  
 *    {'/./ a N'}
 *  
 *  N.B. you can also crash the server with an out of memory error if you really try
 *  
 *    {'/./ aa N'}
 *    
 *  The 'N' flag is silly but Apache invented it, not me, so there must be some reason for it other than 
 *  for playing practical jokes.
 *  
 *  Perhaps fixing IE bugs was the idea.
 *  
 *    {regex : /\\/g, replace : '/', flags : 'N'}
 *    
 *  Or those last minute security considerations when QA will not let you change the code.   
 *    
 *    {regex : /[<>'"]/g, replace : '', flags : 'N'}
 *    {regex : /\0/g, replace : '', flags : 'N'}
 *    
 * Who knows, rewrite is always meant to be voodoo.
 * 
 */

exports.testFliexibleFormats = function(test){
	

	rewrite.setRules( [
                     
                     "^(.*)$ $1 F,L"  ,

                     "^(.*)$	$1	F,L"  ,

                     "^(.*)$	$1	"  ,

                     "^(.*)$	$1	"  ,

                     {regex : '^(.*)$', replace : '$1', flags : ['F']} ,
                     
                     {regex : '^(.*)$', replace : '$1', flags : 'F,NC'} ,
                     
                     {regex : '^(.*)$', replace : '$1', flags : ['F','NC']} ,
                     
                     {regex : '^(.*)$', replace : '$1', flags : []} ,
                     
                     {regex : '^(.*)$', replace : '$1' } ,

                     {regex : /\\/g, replace : '/', flags : null},
                     
                     {regex : /\\/g, replace : '/', flags : []},
                     
                     {regex : /\\/g, replace : '/'}
                     
                     ] );
	
	test.ok(true);
	test.done();
};

