'use strict';

/* global _ */

angular.module('scradioApp')
.controller('RadioCtrl', function ($scope, $q, $sce, SoundCloud) {
  var sc = SoundCloud;

  $scope.seeds = []; // array of user objects
  $scope.loadedSeeds = [];
  $scope.originalSeeds = [];
  $scope.unplayed = []; // possible tracks to play
  $scope.played = []; // list of tracks already played, or skipped
  $scope.currentTrack = {};
  $scope.loadHistory = {};

  $scope.addSeed = function(url) {
    var user;

    sc.resolveURL(url).then(function(response) {
      if (response.kind === 'track') {
        if (!_.some($scope.unplayed, { id: response.id })) {
          $scope.unplayed.push(response);
        }
        user = response.user;
      } else if (response.kind === 'user') {
        user = response;
      }

      if (!_.some($scope.originalSeeds, { id: user.id })) {
        $scope.seeds.push(user);
        $scope.originalSeeds.push(user);
      }
    });
  };

  $scope.getNewLeads = function() {
    var random = Math.floor(Math.random() * $scope.originalSeeds.length),
        user = $scope.originalSeeds[random],
        apiLimit = 50,
        hid = 'user' + user.id,
        offset = Math.ceil($scope.loadHistory[hid].followings/apiLimit) * apiLimit;

    if (!$scope.loadHistory[hid]) {
      $scope.loadHistory[hid] = {
        tracks: 0,
        favorites: 0,
        followings: 0,
        tracksDone: false,
        favoritesDone: false,
        followingsDone: false
      };
    }

    if ($scope.loadHistory[hid].followingsDone) {
      return;
    }

    sc.getUserFollowings(user.id, { limit: apiLimit, offset: offset }).then(function (users) {
      if (!users.length) {
        $scope.loadHistory[hid].followingsDone = true;
      }

      for (var i = 0; i < users.length; i++) {
        $scope.seeds.push(users[i]);
      }
      $scope.loadHistory[hid].followings += users.length;
    });
  };

  $scope.loadNewTracks = function() {
    var random = Math.floor(Math.random() * $scope.seeds.length),
        user = $scope.seeds[random],
        apiLimit = 50,
        hid = 'user' + user.id,
        deferred = $q.defer();

    console.log('loading from user ' + user.username);

    // set default history if it doesn't exist
    if (!$scope.loadHistory[hid]) {
      $scope.loadHistory[hid] = {
        tracks: 0,
        favorites: 0,
        followings: 0,
        tracksDone: false,
        favoritesDone: false,
        followingsDone: false
      };
    }

    console.log($scope.loadHistory[hid]);

    var loadTracks = function() {
      var offset = Math.ceil($scope.loadHistory[hid].tracks/apiLimit) * apiLimit;
      console.log(offset);

      sc.getTracksByUser(user.id, { limit: apiLimit, offset: offset }).then(function (tracks) {
        if (!tracks.length) {
          $scope.loadHistory[hid].tracksDone = true;
          finished();
          return;
        }

        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].streamable) {
            tracks[i].stream = $sce.trustAsResourceUrl(tracks[i].stream_url + '?client_id=' + sc.getClientId());
            $scope.unplayed.push(tracks[i]);
          }
        }
        $scope.loadHistory[hid].tracks += tracks.length;
        finished();
      });
    };

    var loadFavorites = function() {
      var offset = Math.ceil($scope.loadHistory[hid].favorites/apiLimit) * apiLimit;

      sc.getUserFavorites(user.id, { limit: apiLimit, offset: offset }).then(function (tracks) {
        if (!tracks.length) {
          $scope.loadHistory[hid].favoritesDone = true;
          finished();
          return;
        }

        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].streamable) {
            tracks[i].stream = $sce.trustAsResourceUrl(tracks[i].stream_url + '?client_id=' + sc.getClientId());
            $scope.unplayed.push(tracks[i]);
          }
        }
        $scope.loadHistory[hid].favorites += tracks.length;
        finished();
      });
    };

    loadTracks();
    loadFavorites();

    // after all three functions have fired
    var finished = _.after(2, function() {

      // if the tracks and favorites have loaded, remove the seed
      if ($scope.loadHistory[hid].tracksDone && $scope.loadHistory[hid].favoritesDone) {
        $scope.loadedSeeds.push($scope.seeds.splice(random, 1)[0]);
      }

      deferred.resolve();
    });

    return deferred.promise;
  };

  $scope.getNextTrack = function() {
    var randomTrack = Math.floor(Math.random() * $scope.unplayed.length);

    if (!$scope.unplayed.length) {
      $scope.loadNewTracks().then($scope.getNextTrack);
    }

    if ($scope.currentTrack) {
      $scope.played.push($scope.currentTrack);
    }

    $scope.currentTrack = $scope.unplayed.splice(randomTrack, 1)[0];
  };
});