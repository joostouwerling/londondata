'use strict';

// Declare app level module which depends on views, and components
angular.module('BikePlanner', [
  'ngRoute',
  'BikePlanner.planner',
  'BikePlanner.info',
  'BikePlanner.route'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/planner'});
}]);
