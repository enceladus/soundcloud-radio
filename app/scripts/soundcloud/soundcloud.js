'use strict';

// Provider for the SoundCloud API
angular.module('scradioApp').provider('SoundCloud', function() {
  var clientId = 'SeES8KzD8c44J9IU8djbVg';

  var sc = function(endpoint, params) {
    var api = 'http://api.soundcloud.com/',
        paramArray = [],
        apiCall = '';
    
    for (var p in params) {
      if (params.hasOwnProperty(p)) {
        paramArray.push(encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
      }
    }

    apiCall = api + endpoint + '.json' + (params ? '?' : '') + paramArray.join('&') + (params ? '&' : '?') + 'client_id=' + clientId;
    console.log(apiCall);
    return apiCall;
  };

  

  this.$get = function($q, $http) {

    return {
      urlType: function(url) {
        // return type of resource of a given URL
        
        // for now, we're just dealing with users. Change this later to use the API's /resolve
        return url;
      },
      getClientId: function() {
        return clientId;
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
      getUserFromUrl: function(url) {
        // returns user object from URL
        return url;
      },
      getTracksByUser: function(id, params) {
        var tracks = $q.defer();

        $http.get(sc('users/' + id + '/tracks', params)).success(function (response) {
          tracks.resolve(response);
        }).error(function (err) {
          tracks.reject(err);
        });

        return tracks.promise;
      },
      getUserFavorites: function(id, params) {
        var tracks = $q.defer();

        $http.get(sc('users/' + id + '/favorites', params)).success(function (response) {
          tracks.resolve(response);
        }).error(function (err) {
          tracks.reject(err);
        });

        return tracks.promise;
      },
      getUserFollowings: function(id, params) {
        var tracks = $q.defer();

        $http.get(sc('users/' + id + '/followings', params)).success(function (response) {
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