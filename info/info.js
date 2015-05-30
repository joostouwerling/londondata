'use strict'


angular.module('BikePlanner.info', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/info', {
    templateUrl: 'info/info.html',
    controller: 'InfoController'
  });
}])

.controller('InfoController', function() {
    
});