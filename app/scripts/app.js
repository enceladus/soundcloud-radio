'use strict';

/**
 * @ngdoc overview
 * @name scradioApp
 * @description
 * # scradioApp
 *
 * Main module of the application.
 */
angular
  .module('scradioApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ui.router',
    'ngSanitize',
    'ngTouch',
  ])
  .config([ '$routeProvider', '$locationProvider', '$stateProvider',
function ($routeProvider, $locationProvider, $stateProvider) {
  $locationProvider.html5Mode({
        enabled: true
    });
      $stateProvider
        .state('default', {
            url: "/",
            views: {
                "master": {
                    templateUrl: '/views/main.html',
                    controller: 'RadioCtrl',
                    controllerAs: 'RadioCtrl'
                }
            }
        });
}]);
