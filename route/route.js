'use strict';

angular.module('BikePlanner.route', [
    'ngRoute',
    'BikePlanner.route.RouteDataContainer',
    'BikePlanner.google.DirectionsRendererFactory',
    'BikePlanner.geo.LondonGeoBounds'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/route', {
    templateUrl: 'route/route.html',
    controller: 'RouteController'
  });
}])

.controller('RouteController', [
    '$scope', 
    'DirectionsRendererFactory', 
    'LondonGeoBounds', 
    'RouteDataContainer', 
    '$location',
    function($scope, DirectionsRendererFactory, LondonGeoBounds, RouteDataContainer, $location) {
    
    
    $scope.startText = null;
    $scope.endText = null;
    $scope.numPeople = 0;
    
    
    $scope.routeDisplay = 'walk1';
    $scope.setRouteDisplay = function(key) {
        $scope.routeDisplay = key;
    };
    $scope.routePanelVisible = function(key) {
        return $scope.routeDisplay == key;
    };
    
    var map,dr1,dr2,dr3;
    var routeData;
    
    $scope.$on('$viewContentLoaded', function(){
        
        routeData = RouteDataContainer.get();
        if(routeData === null) {
            $location.path('/planner');
            return;
        }
        
		map = new google.maps.Map(document.getElementById('map-canvas'), {
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        map.fitBounds(LondonGeoBounds.bounds);
		dr1 = DirectionsRendererFactory.build('WALKING', map, 'directionsPanel');
		dr2 = DirectionsRendererFactory.build('BICYCLING', map, 'directionsPanel2');
		dr3 = DirectionsRendererFactory.build('WALKING', map, 'directionsPanel3');
		
        initializeRoute();
		
	});
    
    var resetRoute = function resetRoute() {
		dr1.set("directions", null);
		dr2.set("directions", null);
		dr3.set("directions", null);
	};
	
	var initializeRoute = function() {
        resetRoute();
        routeData = RouteDataContainer.get();
        $scope.startText = routeData.startText;
        $scope.endText = routeData.endText;
        $scope.numPeople = routeData.numPeople;
        dr1.setDirections(routeData.routeData.walk1);
        dr2.setDirections(routeData.routeData.bicycle);
        dr3.setDirections(routeData.routeData.walk2);
        var markerStartStation = new google.maps.Marker({
            map:map,
            animation: google.maps.Animation.DROP,
            position: routeData.routePoints.startStation,
            icon: 'components/cycle-hire-pushpin-icon.gif'
        });
        var markerEndStation = new google.maps.Marker({
            map:map,
            animation: google.maps.Animation.DROP,
            position: routeData.routePoints.endStation,
            icon: 'components/cycle-hire-pushpin-icon.gif'
        });
        var markerEnd = new google.maps.Marker({
            map:map,
            animation: google.maps.Animation.DROP,
            position: routeData.routePoints.end,
            icon: 'components/markerB.png'
        });
        var markerStart = new google.maps.Marker({
            map:map,
            animation: google.maps.Animation.DROP,
            position: routeData.routePoints.start,
            icon: 'components/markerA.png'
        });
	}
    
}]);