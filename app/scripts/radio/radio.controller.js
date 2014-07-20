'use strict';

/* global _ */

angular.module('scradioApp')
.controller('RadioCtrl', function ($scope, SoundCloud) {
  var sc = SoundCloud;

  $scope.seeds = []; // array of user objects
  $scope.loadedSeeds = [];
  $scope.originalSeeds = [];
  $scope.unplayed = []; // possible tracks to play
  $scope.played = []; // list of tracks already played, or skipped
  $scope.currentTrack = {};

  $scope.addSeed = function(url) {
    var user;

    sc.resolveURL(url).then(function(response) {
      if (response.kind === 'track') {
        $scope.unplayed.push(response);
        user = response.user;
      } else if (response.kind === 'user') {
        user = response;
      } else if (response.errors) {
        console.log('Please enter a valid SoundCloud track or user URL');
      }

      if (!_.some($scope.originalSeeds, { id: response.id })) {
        $scope.seeds.push(user);
        $scope.originalSeeds.push(user);
      }
    });
  };

  $scope.loadNewTracks = function() {
    // Currently, we deal with four possible sources:
    //   1. the seed's tracks
    //   2. the seed's favorites
    //   3. the seed's followings' tracks
    //   4. the seed's followings' favorites
    // There are obviously many different other sources,
    // such as the seed's favorites' creators' favorites,
    // but these will be implemented later. This function
    // will probably need the most work in future versions.
    var random = Math.floor(Math.random() * $scope.seeds.length),
        user = $scope.seeds[random];

    // load the user's tracks and favorites
    sc.getTracksByUser(user.id).then(function (tracks) {
      $scope.unplayed.push(tracks);
    });

    sc.getUserFavorites(user.id).then(function (tracks) {
      $scope.unplayed.push(tracks);
    });
    
    // remove the seed and archive it as a loaded seed
    $scope.loadedSeeds.push($scope.seeds.splice(random, 1));
    return user;
  };

  $scope.getNextTrack = function() {
    var randomTrack;

    if (!$scope.unplayed.length) {
      $scope.unplayed.push($scope.loadNewTracks());
    }

    randomTrack = $scope.unplayed.pop(Math.floor(Math.random() * $scope.unplayed.length));
    $scope.played.push($scope.currentTrack);
    $scope.currentTrack = randomTrack;
  };
});