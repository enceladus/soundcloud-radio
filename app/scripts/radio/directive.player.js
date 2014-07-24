'use strict';

// Player based on plangular: https://github.com/jxnblk/plangular
// reduced to only handle the currently playing track

angular.module('scradioApp').directive('player', function ($document, SoundCloud) {
  var audio = $document[0].createElement('audio'),
      sc = SoundCloud;

  return {
    restrict: 'E',
    scope: {
      track: '=',
      playing: '=',
      finished: '&'
    },
    templateUrl: 'views/player.html',
    link: function(scope) {
      /* jshint camelcase: false */

      scope.$watch('track', function(newTrack) {
        if (newTrack) {
          audio.src = newTrack.stream_url + '?client_id=' + sc.getClientId();
          audio.volume = 0;
          audio.play();
        }
      });

      scope.$watch('playing', function(newVal) {
        if (newVal) {
          audio.play();
        } else {
          audio.pause();
        }
      });

      scope.getArtwork = function(track) {
        if (track) {
          if (track.artwork) {
            return track.artwork;
          }
          if (track.user) {
            return track.user.avatar_url.replace('-large', '-crop');
          }
        }
      };

      audio.addEventListener('timeupdate', function() {
        scope.$apply(function() {
          scope.currentTime = (audio.currentTime * 1000).toFixed();
          scope.duration = (audio.duration * 1000).toFixed();
        });  
      }, false);

      scope.seekTo = function($event){
        var xpos = $event.offsetX / $event.target.offsetWidth;
        audio.currentTime = (xpos * audio.duration);
      };

      audio.addEventListener('ended', function() {
        console.log('DONE');

        scope.$apply(function() {
          scope.finished();
        });
      });
    }
  };
}).filter('playTime', function() {
  return function(ms) {
    var hours = Math.floor(ms / 36e5),
        mins = '0' + Math.floor((ms % 36e5) / 6e4),
        secs = '0' + Math.floor((ms % 6e4) / 1000);
        mins = mins.substr(mins.length - 2);
        secs = secs.substr(secs.length - 2);
    if(!isNaN(secs)){
      if (hours){
        return hours+':'+mins+':'+secs;  
      } else {
        return mins+':'+secs;  
      }
    } else {
      return '00:00';
    }
  };
});