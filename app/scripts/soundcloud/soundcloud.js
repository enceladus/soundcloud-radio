'use strict';

/* global SC */

// Provider for the SoundCloud API
angular.module('scradioApp').provider('SoundCloud', function() {
  var sc = function(endpoint, params) {
    var clientId = 'SeES8KzD8c44J9IU8djbVg',
        api = 'http://api.soundcloud.com/',
        paramArray = [];
    
    for (var p in params) {
      if (params.hasOwnProperty(p)) {
        paramArray.push(encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
      }
    }

    return api + endpoint + '.json' + (params ? '?' : '') + paramArray.join('&') + (params ? '&' : '?') + 'client_id=' + clientId;
  };

  

  this.$get = function($q, $http) {

    return {
      urlType: function(url) {
        // return type of resource of a given URL
        
        // for now, we're just dealing with users. Change this later to use the API's /resolve
        return url;
      },
      resolveURL: function(url) {
        var deferred = $q.defer();

        $http.get(sc('resolve', { url: url })).success(function(response) {
          deferred.resolve(response);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      },
      getUser: function(id) {
        // returns user object with a given id
        
        /*var user = $q.defer(); 
        
        
        SC.get('/users/' + id, function (userData, err) {
          if (err) {
            user.reject(err.message);
          } else {
            user.resolve(userData);
          }
        });*/

        //return user.promise;
        return SC.get('/users/' + id, function(user) {
          return user;
        });
      },
      getUserFromUrl: function(url) {
        // returns user object from URL
        return url;
      },
      getTracksByUser: function(id) {
        var tracks = $q.defer();

        $http.get(sc('/users/' + id + '/tracks')).success(function (response) {
          tracks.resolve(response);
        }).error(function (err) {
          tracks.reject(err);
        });

        return tracks.promise;
      },
      getUserFavorites: function(id) {
        var tracks = $q.defer();

        $http.get(sc('/users/' + id + '/favorites')).success(function (response) {
          tracks.resolve(response);
        }).error(function (err) {
          tracks.reject(err);
        });

        return tracks.promise;
      },
      getUserFollowings: function(id) {
        var tracks = $q.defer();

        $http.get(sc('/users/' + id + '/followings')).success(function (response) {
          tracks.resolve(response);
        }).error(function (err) {
          tracks.reject(err);
        });

        return tracks.promise;
      },
      getUserId: function(username) {
        // gets user ID from username
        return username;
      },
      getTrackFromUrl: function(url) {
        // returns track object from URL
        return url;
      },
      getTrack: function(id) {
        // returns track from track ID
        return id;
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