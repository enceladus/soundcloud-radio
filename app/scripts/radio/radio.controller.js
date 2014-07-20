'use strict';

angular.module('scradioApp')
.controller('RadioCtrl', function ($scope, SoundCloud) {
  var sc = SoundCloud;
  console.log(sc);
  sc.init('SeES8KzD8c44J9IU8djbVg');

  $scope.seeds = []; // array of user objects
  $scope.unplayed = []; // possible tracks to play
  $scope.played = []; // list of tracks already played, or skipped
  $scope.currentTrack = {};

  $scope.addSeed = function(url) {
    // parse URL, return user
    console.log(url);

    var user = sc.getUser(3207);

    $scope.seeds.push(user);
  };

  var randomSeed = function() {
    return $scope.seeds[Math.floor(Math.random() * $scope.seeds.length)];
  };

  var loadNewTracks = function() {
    // Currently, we deal with four possible sources:
    //   1. the seed's tracks
    //   2. the seed's favorites
    //   3. the seed's followings' tracks
    //   4. the seed's followings' favorites
    // There are obviously many different other sources,
    // such as the seed's favorites' creators' favorites,
    // but these will be implemented later. This function
    // will probably need the most work in future versions.
    
    var user = randomSeed();
    return user;
  };

  $scope.getNextTrack = function() {
    var randomTrack;

    if (!$scope.unplayed.length) {
      $scope.unplayed.push(loadNewTracks());
    }

    randomTrack = $scope.unplayed.pop([Math.floor(Math.random() * $scope.unplayed.length)]);
    $scope.played.push($scope.currentTrack);
    $scope.currentTrack = randomTrack;
  };
});