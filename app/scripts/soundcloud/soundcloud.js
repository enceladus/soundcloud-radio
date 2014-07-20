'use strict';

/* global SC */

// Provider for the SoundCloud API
angular.module('scradioApp').provider('SoundCloud', function() {
  this.clientId = '';

  this.init = function(clientId) {
    SC.initialize({
      clientId: clientId
    });
  };

  this.$get = function($q) {

    return {
      urlType: function(url) {
        // return type of resource of a given URL
        
        // for now, we're just dealing with users. Change this later to use the API's /resolve
        return 'user';
      },
      getUser: function(id) {
        // returns user object with a given id
        
        var user = $q.defer(); 
        
        
        SC.get('/users/' + id, function (userData, err) {
          if (err) {
            user.reject(err.message);
          } else {
            user.resolve(userData);
          }
        });

        return user.promise;
      },
      getUserFromUrl: function(url) {
        // returns user object from URL
      },
      getTracksByUser: function(id) {
        var tracks = $q.defer();

        SC.get('/users/' + id + '/tracks', function (tracks, err) {
          return tracks;
        });
      },
      getUserFavorites: function(id) {
        SC.get('/users/' + id + '/favorites', function (tracks) {
          return tracks;
        });
      },
      getUserFollowings: function(id) {
        SC.get('/users/' + id + '/followings', function (users) {
          return users;
        });
      },
      getUserId: function(username) {
        // gets user ID from username
      },
      getTrackFromUrl: function(url) {
        // returns track object from URL
      },
      getTrack: function(id) {
        // returns track from track ID
      }
    };
  };
});

/*
var seed = 'https://soundcloud.com/fybeone';
var type = urlType(seed);
var tracks = [],
    userSeed;
if (type === 'user') {
  userSeed = getUserFromUrl(seed);
} else if (type === 'track') {
  var track = getTrackFromUrl(seed);
  userSeed = getUser(track.user_id);
}

function loadNextTrack() {
  // randomly select one of the following paths:
  // 1. play a track made by a seed
  // 2. play a track favorited by a seed
  // 3. play a track made by someone a seed follows
  // 4. play a track favorited by someone a seed follows
  
  // 1
  tracks.push(getTracksByUser(userSeed.id));

  // 2
  tracks.push(getUserFavorites(userSeed.id));

  // 3
  var followings = getUserFollowings(userSeed.id);
  tracks.push(getTracksByUser(followings[Math.floor(Math.random()*followings.length)]));

  // 4
  var randomFollowing = followings[Math.floor(Math.random() * followings.length)];
  tracks.push(getUserFavorites(getUser(randomFollowing.id)));
}*/