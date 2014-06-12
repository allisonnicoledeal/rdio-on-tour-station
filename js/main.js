var user_collection;
var events;
var track_to_queue;
var track_search_results = [];
var next_track;

function init() {
	console.log('init function - page refreshed');

	R.ready(function() {
		if (R.authenticated()) {
			console.log('authenticated!');
		} else {
			console.log("unauthenticated!");
			R.authenticate();
		}

		user_collection = [];
		getCollection();
		events = "";
		track_to_queue = [];
		track_search_results = [];

		R.player.on("change:playingTrack", function(track) {
			track = R.player.playingTrack();
	  		artist = track.get('artist');
	  		source = R.player.playingSource();
	  		icon = source.get("icon")

			$("#track").text("Track: " + track.get("name"));
	  		$("#album").text("Album: " + track.get("album"));
		    $("#artist").text("Artist: " + track.get("artist"));
		    $("#albumCover").attr("src", icon);

	  		$(".bit-widget-initializer").data("artist", artist);
	  		artist_encode = encodeURI(artist);
	  		$(".bit-widget-initializer").attr("href", "http://www.bandsintown.com/" + artist_encode);
		});
	});
}

function onPlayClick() {
	console.log('play CLICKED');
	// while (events.length < 1) {
		selectSong();
		console.log("events" + events);
	// }

	R.ready(function() {
			// selectSong();
  		// R.player.play({source: "a2161560"});
  		R.player.queue.play();
  		console.log("playing");
		});
}

function onPauseClick() {
	console.log('pause clicked');
	R.ready(function() {
  		R.player.pause();
  		console.log("paused");
		});
}

function onNextClick() {
	console.log('next clicked');
	R.player.next();
}

function selectSong(){
	console.log('IN SELECT SONG');
	console.log(user_collection);
	var index = Math.floor((Math.random()*(user_collection.length)));
	console.log('index' + index);
	console.log(user_collection[index]);
	var next_artist = user_collection[index];
	console.log("next artist: " + next_artist);

	$.ajax({
        url: 'http://api.bandsintown.com/artists/' + encodeURI(next_artist) + '/events/recommended?format=json&app_id=ONTOURAPP&api_version=2.0&location=San+Francisco,CA&callback=showEvents',
        dataType: 'jsonp',
        success: function(dataWeGotViaJsonp){
            console.log('data' + dataWeGotViaJsonp);
        }
    });
}

function showEvents(data){
	console.log('jsonp data: ' + data);
	console.log("next artist to play" + data[0].artists[0].name);
	searchForTrack(data);
}

function searchForTrack(data) {
	track_search_results = [];
	console.log('data: ' + data);
	console.log('in search for track');
	console.log('searching' + data[0].artists[0].name);
	R.request({
		  method: "search",
		  content: {
		  	query: data[0].artists[0].name,
		  	types: 'track',
		    extras: "-*,artist,key,icon,name,shortUrl,canStream",
		    start: 0,
		    count: 100
		  },
		  success: function(response) {
		  	for (i = 0; i < response.result.results.length; i++) {
					track_search_results.push(response.result.results[i].key);		    	
		    }
	    	console.log(track_search_results);
		  	var index = Math.floor((Math.random()*track_search_results.length));
		  	songToQueue = track_search_results[index];
		  	console.log("song to queue: ", songToQueue);
		  	R.player.queue.add(songToQueue);
		},
		  error: function(response) {
		  	console.log('in error');
		    console.log("error: " + response.message);
		  }
		});
}

function getCollection() {
	var result;
	R.request({
		  method: "getAlbumsInCollection",
		  content: {
		  	user: R.currentUser,
		    extras: "-*,artist,icon,name,shortUrl,canStream",
		    start: 0,
		    count: 50
		  },
		  success: function(response) {
		    for (i = 0; i < response.result.length; i++) {
		    	user_collection.push(response.result[i].artist);
		    }
		  },
		  error: function(response) {
		    console.log("error: " + response.message);
		  }
		});
}

init();







