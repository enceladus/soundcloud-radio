'use strict';

// Player based on plangular: https://github.com/jxnblk/plangular

angular.module('scradioApp').directive('player', function ($document) {
  var audio = $document[0].createElement('audio');

  var player = {
    playing: null,
    paused: null,
    track: null,
    tracks: null,
    i: 0,
    play: function(i) {
      i = player.i || 0;
      player.track = player.tracks[i];
      player.i = i;

      if (player.paused !== player.track) {
        audio.src = player.track.stream;
      }

      audio.play();
      player.playing = player.track;
      player.paused = false;
    },
    pause: function() {
      audio.pause();
      player.paused = player.track;
      player.playing = false;
    },
    next: function() {
      if (player.i+1 >= player.length) {
        // must get new track
      } else {
        player.play(player.i+1);
      }
    },
    previous: function() {
      if (player.i > 1) {
        player.play(player.i-1);
      }
    }
  };

  return {
    restrict: 'E',
    scope: {
      audio: audio,
      track: '=',
      tracks: '=',
      player: player
    },
    templateUrl: 'views/player.html',
    transclude: true,
    link: function(scope) {
      player.tracks = scope.tracks;

      audio.addEventListener('timeupdate', function() {
        if (scope.track === player.track || (scope.playlist && scope.playlist.tracks === player.tracks)){
          scope.$apply(function() {
            scope.currentTime = (audio.currentTime * 1000).toFixed();
            scope.duration = (audio.duration * 1000).toFixed();
          });  
        }
      }, false);

      audio.addEventListener('ended', player.next);

      scope.seekTo = function($event){
        var xpos = $event.offsetX / $event.target.offsetWidth;
        audio.currentTime = (xpos * audio.duration);
      };
    }
  };
});