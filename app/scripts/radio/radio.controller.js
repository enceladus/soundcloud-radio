'use strict';

/* global _ */

angular.module('scradioApp')
.controller('RadioCtrl', function ($scope, $q, $sce, SoundCloud, Stations) {
  /* jshint camelcase: false */

  var sc = SoundCloud;
  $scope.stations = Stations;

  $scope.clear = function() {
    $scope.seeds = []; // array of user objects
    $scope.loadedSeeds = [];
    $scope.originalSeeds = [];
    $scope.unplayed = []; // possible tracks to play
    $scope.played = []; // list of tracks already played, or skipped
    $scope.currentTrack = {};
    $scope.loadHistory = {};
    $scope.playing = false;
    $scope.playlist = [];
    $scope.i = 0;
    $scope.showSeedForm = false;
  };

  $scope.clear();

  $scope.setStation = function(station) {
    $scope.clear();

    for (var i = 0; i < station.seeds.length; i++) {
      $scope.seeds.push(station.seeds[i]);
      $scope.originalSeeds.push(station.seeds[i]);
    }

    $scope.getNewTrack();
  };

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

      console.log(user);

      if (user.track_count >= 5 || user.public_favorites_count >= 10) {
        if (!_.some($scope.originalSeeds, { id: user.id })) {
          $scope.seeds.push(user);
          $scope.originalSeeds.push(user);
          $scope.loadNewTracks(user);
        } else {
          console.log('seed already exists');
          return;
        }
      } else {
        console.log('not enough stuff to mess with, pick a new dude');
        return;
      }

      if ($scope.unplayed.length < 1) {
        console.log('unplayed list is too small, getting a new track');
        $scope.getNewTrack();
      }

      $scope.newSeedURL  = '';
      $scope.showSeedForm = false;
    }, function() {
      console.log('please enter a correct soundcloud user or track url');
    });
  };

  $scope.getArtwork = function(track) {
    if (track.artwork_url) {
      return track.artwork_url.replace('-large', '-t500x500');
    } else if (track.user.avatar_url) {
      return track.user.avatar_url.replace('-large', '-t500x500');
    } else {
      // eventually return placeholder
      return 'http://placehold.it/500';
    }
  };

  $scope.getAllFollowings = function(user, offset, deferred) {
    if (typeof offset !== 'number') {
      offset = 0;
    }

    var apiLimit = 200;

    if (!deferred) {
      deferred = $q.defer();
    }

    sc.getUserFollowings(user.id, { limit: apiLimit, offset: offset }).then(function (users) {
      console.log(offset);
      console.log(user.followings_count);

      if (offset >= user.followings_count) {
        $scope.getNewTrack();
        deferred.resolve();
        return;
      }

      for (var i = 0; i < users.length; i++) {
        $scope.seeds.push(users[i]);
      }

      $scope.getAllFollowings(user, offset + users.length, deferred);
    });

    return deferred.promise;
  };

  $scope.loadNewTracks = function(userSeed) {
    var deferred = $q.defer();

    if (!$scope.seeds.length && $scope.playlist.length) {
      $scope.getAllFollowings($scope.originalSeeds[Math.floor(Math.random() * $scope.originalSeeds.length)]).then(function () {
        $scope.loadNewTracks();
      });
      return deferred.promise;
    }

    var random = Math.floor(Math.random() * $scope.seeds.length),
        user = userSeed || $scope.seeds[random],
        apiLimit = 50,
        hid = 'user' + user.id;

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
      console.log('offset: ' + offset);

      if ($scope.loadHistory[hid].tracksDone) {
        finished();
        return;
      }

      sc.getTracksByUser(user.id, { limit: apiLimit, offset: offset }).then(function (tracks) {
        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].streamable && !_.any($scope.unplayed, { permalink_url: tracks[i].permalink_url })) {
            tracks[i].stream = $sce.trustAsResourceUrl(tracks[i].stream_url + '?client_id=' + sc.getClientId());
            if (tracks[i].artwork_url) {
              tracks[i].artwork = tracks[i].artwork_url.replace('-large', '-crop');
            }
            $scope.unplayed.push(tracks[i]);
          }
        }
        $scope.loadHistory[hid].tracks += tracks.length;

        if ($scope.loadHistory[hid].tracks >= user.track_count) {
          $scope.loadHistory[hid].tracksDone = true;
        }

        finished();
      });
    };

    var loadFavorites = function() {
      var offset = Math.ceil($scope.loadHistory[hid].favorites/apiLimit) * apiLimit;

      if ($scope.loadHistory[hid].favoritesDone) {
        finished();
        return;
      }

      sc.getUserFavorites(user.id, { limit: apiLimit, offset: offset }).then(function (tracks) {
        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].streamable) {
            tracks[i].stream = $sce.trustAsResourceUrl(tracks[i].stream_url + '?client_id=' + sc.getClientId());
            if (tracks[i].artwork_url) {
              tracks[i].artwork = tracks[i].artwork_url.replace('-large', '-crop');
            }
            $scope.unplayed.push(tracks[i]);
          }
        }
        $scope.loadHistory[hid].favorites += tracks.length;

        if ($scope.loadHistory[hid].favorites >= user.public_favorites_count) {
          $scope.loadHistory[hid].favoritesDone = true;
        }

        finished();
      });
    };

    loadTracks();
    loadFavorites();

    // after all functions have fired
    var finished = _.after(2, function() {

      // if the tracks and favorites have loaded, remove the seed
      if ($scope.loadHistory[hid].tracksDone && $scope.loadHistory[hid].favoritesDone) {
        $scope.loadedSeeds.push($scope.seeds.splice(random, 1)[0]);
      }

      console.log($scope.loadHistory[hid]);

      deferred.resolve();
    });

    return deferred.promise;
  };

  $scope.getNewTrack = function() {
    var random = Math.floor(Math.random() * $scope.unplayed.length),
        randomTrack,
        existsInPlaylist = false,
        found = false;

    console.log('getNewTrack called');

    if ($scope.unplayed.length <= 3) {
      console.log('not enough tracks, loading tracks');
      $scope.loadNewTracks().then(function () {
        console.log('loading tracks finished');
        $scope.getNewTrack();
      });
      return;
    }

    if ($scope.currentTrack) {
      $scope.played.push($scope.currentTrack);
    }

    // check that it doesn't already exist in the playlist
    while (!found) {
      existsInPlaylist = false;
      randomTrack = $scope.unplayed.splice(random, 1)[0];
      for (var i = 0; i < $scope.playlist.length; i++) {
        if (randomTrack.permalink_url === $scope.playlist[i].permalink_url) {
          existsInPlaylist = true;
          break;
        }
      }

      if (!existsInPlaylist) {
        found = randomTrack;
      }
    }

    $scope.playlist.push(found);
    
    // if this is a new playlist we should load a second track
    if ($scope.playlist.length === 1) {
      $scope.playing = true;
      $scope.i = 0;
      $scope.getNewTrack();
    }
  };

  $scope.next = function() {
    if ($scope.i < $scope.playlist.length - 1) {
      $scope.i += 1;
    }

    // if we are now on the penultimate track, load a new one
    if ($scope.i >= $scope.playlist.length -2) {
      $scope.getNewTrack();
    }

    $scope.playing = true;
  };

  $scope.previous = function() {
    if ($scope.i > 0) {
      $scope.i -= 1;
    }
  };

  $scope.skipToTrack = function(index) {
    $scope.i = index;
  };

  $scope.$watch('i', function() {
    $scope.currentTrack = $scope.playlist[$scope.i];
  });
});