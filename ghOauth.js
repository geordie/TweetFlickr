var 
	sys = require('sys'),
	crypto= require('crypto'),
	sha1= require('../node-oauth/lib/sha1'),
    http= require('http'),
    URL= require('url'),
    querystring= require('querystring'); 

var _consumerSecret = '';

exports.GHOauth = function(consumerKey, consumerSecret) 
{
	this._consumerKey = consumerKey;
	this._consumerSecret = consumerSecret;
}

NONCE_CHARS = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n',
              'o','p','q','r','s','t','u','v','w','x','y','z','A','B',
              'C','D','E','F','G','H','I','J','K','L','M','N','O','P',
              'Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3',
              '4','5','6','7','8','9'];
			  
exports.GHOauth.prototype.getNonce = function(nonceSize)
{
	var result = [];
	var chars= NONCE_CHARS;
	var char_pos;
	var nonce_chars_length= chars.length;

	for (var i = 0; i < nonceSize; i++)
	{
		char_pos= Math.floor(Math.random() * nonce_chars_length);
		result[i]=  chars[char_pos];
	}
	return result.join('');
}

exports.GHOauth.prototype.getTimestamp = function ()
{
	return Math.floor( (new Date()).getTime() / 1000 );
}

exports.GHOauth.prototype._normalizeUrl = function(url)
{
	var parsedUrl= URL.parse(url, true)
	var port ="";
	if( parsedUrl.port ) 
	{ 
		if( (parsedUrl.protocol == "http:" && parsedUrl.port != "80" ) || (parsedUrl.protocol == "https:" && parsedUrl.port != "443") ) 
		{
			port= ":" + parsedUrl.port;
		}
	}

	if( !parsedUrl.pathname  || parsedUrl.pathname == "" ) parsedUrl.pathname ="/";

	return parsedUrl.protocol + "//" + parsedUrl.hostname + port + parsedUrl.pathname;
}

exports.GHOauth.prototype._encodeData = function(toEncode)
{
	if( toEncode == null || toEncode == "" ) return ""
	else 
	{
		var result= encodeURIComponent(toEncode);

		// Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
		return result.replace(/\!/g, "%21")
		.replace(/\'/g, "%27")
		.replace(/\(/g, "%28")
		.replace(/\)/g, "%29")
		.replace(/\*/g, "%2A");
	}
}

// Takes a literal in, then returns a sorted array
exports.GHOauth.prototype._sortRequestParams = function(argumentsHash) 
{
	var argument_pairs= [];
	for(var key in argumentsHash )
	{   
		argument_pairs[argument_pairs.length]= [key, argumentsHash[key]];
	}
	// Sort by name, then value.
	argument_pairs.sort(function(a,b) 
	{
		if ( a[0]== b[0] )  
		{
			return a[1] < b[1] ? -1 : 1; 
		}
		else return a[0] < b[0] ? -1 : 1;  
	});

	return argument_pairs;
}

exports.GHOauth.prototype._normaliseRequestParams = function(arguments) 
{
	var argument_pairs = this._sortRequestParams( arguments );
	var args = "";
	for(var i=0;i<argument_pairs.length;i++)
	{
		args += this._encodeData( argument_pairs[i][0] );
		args += "="
		args += this._encodeData( argument_pairs[i][1] );
		if( i < argument_pairs.length-1 ) args+= "&";
	}     
	return args;
}

exports.GHOauth.prototype._createSignature = function(signatureBase, tokenSecret) 
{   
	if( tokenSecret === undefined ) var tokenSecret= "";

	else tokenSecret = this._encodeData( tokenSecret ); 

	// consumerSecret is already encoded
	var key = this._consumerSecret + "&" + tokenSecret;
	var hash = sha1.HMACSHA1(key, signatureBase);

	return hash;
}

exports.GHOauth.prototype._createSignatureBase = function(method, url, parameters) 
{
	url = this._encodeData( this._normalizeUrl(url) );
	parameters = this._encodeData( parameters );
	return method.toUpperCase() + "&" + url + "&" + parameters;
}

exports.GHOauth.prototype.getSignature = function(method, url, parameters, tokenSecret) 
{
	var signatureBase = this._createSignatureBase(method, url, parameters); 
	return this._createSignature( signatureBase, tokenSecret ); 
}
