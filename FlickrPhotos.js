var sys=require('sys'); 
var http = require('http');
var CONSTANTS = require('./Constants.js');

var connectionFlickr = http.createClient(80, "api.flickr.com");

// Get timestamp for 1 hour ago
var dateNow = new Date();
var epochTime = ((dateNow.getTime() - dateNow.getMilliseconds()) - 3600000)  / 1000;
sys.puts( "TIME: " + epochTime + "//" + dateNow.getTime());

exports.getPhotos = function( tags, callback ) 
{    
	var requestRecentPhotos = connectionFlickr.request('GET',
		"/services/rest/?method=flickr.photos.search&api_key=" + CONSTANTS.apiKeyFlickr + "&tags=" + tags + "&per_page=10&format=json&nojsoncallback=1&min_upload_date=" + epochTime, {"host":
		"api.flickr.com", "User-Agent": "NodeJS HTTP Client"});
	
	requestRecentPhotos.addListener("response", 
		function(responseRecentPhotos) 
		
		{        
			var responseBody = "";       
			responseRecentPhotos.setEncoding("utf8");
			
			responseRecentPhotos.addListener("data", function(chunk) { responseBody += chunk });        
			responseRecentPhotos.addListener("end", 
			function() 
			{
				
				flickrs = JSON.parse( responseBody );

				sys.puts( "FLICKR RESPONSE: " + responseBody );
				
				var results = flickrs["photos"].photo;
				
				var length = results.length;            
				
				sys.puts( "results: " + length );
				
				for (var i = 0 ; i < length; i++) 
				{   
					pushPhoto(results[i].id, callback );
				}
			});    
		});    
	requestRecentPhotos.end();    
};

function pushPhoto( photoId, callback )
{	
	var requestPhoto = connectionFlickr.request('GET',
		"/services/rest/?method=flickr.photos.getInfo&api_key=" + CONSTANTS.apiKeyFlickr + "&photo_id=" + photoId + "&format=json&nojsoncallback=1", 
		{"host":"api.flickr.com", "User-Agent": "NodeJS HTTP Client"});
	
	requestPhoto.addListener("response", 
		function(responsePhoto) 
		
		{        
			var responseBody = "";       
			responsePhoto.setEncoding("utf8");
			
			responsePhoto.addListener("data", function(chunk) { responseBody += chunk });        
			responsePhoto.addListener("end", 
			function() 
			{
				var photoContainer = JSON.parse( responseBody );
				
				if( photoContainer == null ) return;
				
				photo = photoContainer["photo"];
				
				if( photo == null ) return;
				
				// Build the photo URL
				var photoUrl = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server +"/" + photo.id + "_" + photo.secret + "." + ( photo.originalformat ? photo.originalformat : "jpg" );
				
				
				if( photo.dates.lastupdate > epochTime )
				{
					sys.puts( "NEW time: " + epochTime );
					epochTime = photo.dates.lastupdate;
				}
				
				
				if( callback != null )
				{
					callback( photoUrl );
				}
			});    
		});    
	requestPhoto.end();
}

