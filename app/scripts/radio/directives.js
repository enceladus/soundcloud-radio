'use strict';

angular.module('scradioApp')
.directive('track', function() {
  return {
    restrict: 'E',
    scope: {
      track: '=',
      click: '&',
      current: '='
    },
    templateUrl: 'views/partials/',
    link: function(scope) {
      console.log(scope);
    }
  };
});