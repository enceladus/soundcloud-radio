'use strict';

angular.module('scradioApp')
.directive('playlist', function() {
  return {
    link: function(scope, elem) {
      scope.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

      scope.$watch('i + playlist.length + width', function() {
        // there will be a maximum of five tracks shown (three on screen, one off screen on each side)
        // so we only want "i" in this equation to be at maximum 2
        var margin = -scope.i * scope.width / 3 + (scope.width / 3);
        elem.css({
          width: (scope.width / 3 * scope.playlist.length) + 'px',
          marginLeft: margin
        });
      });
    }
  };
})
.directive('track', function() {
  return {
    link: function(scope, elem) {
      scope.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

      scope.$watch('width', function() {
        elem.css({
          width: (scope.width / 3) + 'px'
        });
      });
    }
  };
});