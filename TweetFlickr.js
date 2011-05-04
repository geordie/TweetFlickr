var sys=require('sys'); 
var http = require('http');
var myBitLy = require('./BitLy');
var myFlickrPhotos = require('./FlickrPhotos');
var myTweeter = require('./postTweet');
var CONSTANTS = require('./constants.js');

var counter = 0;

// Shorten the URL with bit.ly
function photoHandler( photoUrl )
{
	// Callback to TweetPhoto
	myBitLy.shortenUrl( photoUrl, TweetPhoto );
}

// Tweet the photo with the shortened URL
function TweetPhoto( urlToTweet )
{
	var tweetStatus = "Flickr photo tagged " + CONSTANTS.tags + ": " + urlToTweet; 
	myTweeter.Tweet( tweetStatus, CONSTANTS.access_token, CONSTANTS.access_token_secret );
}

// Ticks
function status()
{
	counter++;
	sys.puts( counter );
}

// Get new tagged photos from Flickr
myFlickrPhotos.getPhotos( CONSTANTS.tags, photoHandler );

// Output status every minute
setInterval( status, 60000 );

// Check for new photos every 5 minutes
setInterval( myFlickrPhotos.getPhotos, 300000 );

