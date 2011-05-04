var sys=require('sys'); 
var http = require('http');
var GHOauth = require('./ghOauth').GHOauth;
var CONSTANTS = require('./Constants.js');

var ghOauth = new GHOauth( null, null);
var connectionBitly = http.createClient(80, "api.bit.ly");

exports.shortenUrl = function ( urlToShorten, callback )
{
	// Encode URL part for bit.ly API
	var urlPart = ghOauth._encodeData( urlToShorten );
	
	var shortUrl = "http://api.bit.ly/v3/shorten?login=" + CONSTANTS.userIdBitLy + "&apiKey=" + CONSTANTS.apiKeyBitLy + "&longUrl=" + urlPart;
	
	var requestURLShorten = connectionBitly.request('GET',
		"/v3/shorten?login=" + CONSTANTS.userIdBitLy + "&apiKey=" + CONSTANTS.apiKeyBitLy + "&longUrl=" + urlPart, {"host":
		"api.bit.ly", "User-Agent": "NodeJS HTTP Client"});
	
	
	requestURLShorten.addListener("response", 
		function(responseUrlShorten) 
		
		{        
			var responseBody = "";
			
			responseUrlShorten.setEncoding("utf8");
			
			responseUrlShorten.addListener("data", function(chunk) { responseBody += chunk });        
			responseUrlShorten.addListener("end", 
			
			function() 
			{
				result = JSON.parse( responseBody );            
				
				shortUrl = result["data"].url;
				
				if( callback != null )
				{
					callback( shortUrl );
				}
				
			});    
		});    
	
	requestURLShorten.end();   
}