
var rewrite = require('../lib/rewrite.js');


rewrite.setRules( [
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['L']} ,
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['F']} ,
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['G']} ,
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['N']} ,
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['R=302']} ,
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['S=3']} ,
                     {regex : '^(.*).json$', 
                    	 replace : '\\1', flags : ['T=application/json']} ,
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['CO=name=value;path=/']} ,
                     {regex : '^(.*)$', 
                    	 replace : '\\1', flags : ['NC']}
                     
                     ] );
	


