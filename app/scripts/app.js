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
    'ngSanitize',
    'ngTouch',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'RadioCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
