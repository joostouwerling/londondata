'use strict';

/**
 * https://github.com/grevory/angular-local-storage
 */

angular.module('BikePlanner.planner', [
	'ngRoute', 
	'BikePlanner.route.RouteDataContainer',
	'BikePlanner.google.GoogleAutocomplete',
	'BikePlanner.geo.LondonGeoBounds',
	'BikePlanner.geo.GeoLocation',
	'BikePlanner.stations.SantandarBicycleStations',
	'BikePlanner.stations.NearestStationService',
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/planner', {
    templateUrl: 'planner/planner.html',
    controller: 'PlannerController'
  });
}])


.controller('PlannerController', [
	'$scope', 
	'GoogleAutocomplete', 
	'LondonGeoBounds', 
	'GeoLocation', 
	'SantandarBicycleStations', 
	'NearestStationService', 
	'$location', 
	'RouteDataContainer',
	function($scope, GoogleAutocomplete, LondonGeoBounds, GeoLocation, SantandarBicycleStations, NearestStationService, $location, RouteDataContainer) {
	
	
	/**
	 * The value for the last feed update.
	 */
	$scope.lastUpdate = 0;
	
	/**
	 * Flag to indicate when the app is loading
	 */
	$scope.isLoading = false;
	
	/**
	 * List with all stations.
	 */
	var stations = null;

	/**
	 * Google Maps LatLng objects for the start and end points.
	 */
	var points = {
		start: null,
		end: null
	};

	/**
	 * Text values for the start and end points.
	 */
	$scope.startText = null;
	$scope.endText = null;

	/**
	 * Number of people in the party.
	 */
	$scope.numPeople = 1;

	/**
	 * An error which makes the application unusable. use this when i.e. the 
	 * stations can't be loaded or the Google Maps API is unavailable.
	 */
	$scope.errorKill = null;

	/**
	 * If this var is set, an error message will be shown. The form will still
	 * be visible.
	 */
	$scope.errorShow = null;

	/**
	 * Load all the stations from the feed.
	 */
	SantandarBicycleStations.getBicycleStations(
		function (data) {
			stations = data;
			$scope.lastUpdate = data._lastUpdate;
		},function (err) {
			$scope.errorKill = err;
		}
	);


	/**
	 * Get the nearest stations, whether it is an end or start station,
	 * which can be defined by isStart. success is a callback for success, 
	 * which takes the station as a param.
	 */
	var getNearestStation = function(isStart, success) {
		NearestStationService.getNearestStation(
			(isStart ? points.start : points.end),
			stations,
			isStart,
			$scope.numPeople,
			success,
			function(err) {
				$scope.errorShow = err;
			}
		)
	}

	$scope.getDirections = function() {
		$scope.errorShow = null;
		if(stations == null) {
			$scope.errorKill = 'The Santandar Bicycle stations can not be loaded.';
			return;
		}
		if(points.start == null || points.end == null) {
			$scope.errorShow = 'No begin and/or end address given.';
			return;
		}
		if(isNaN(parseInt($scope.numPeople))) {
			$scope.errorShow = 'The number of people is not an integer.';
			return;
		}
		$scope.isLoading = true;
		$scope.numPeople = parseInt($scope.numPeople);
		getNearestStation(true, function(startStation) {
			getNearestStation(false, function(endStation) {
				getApiDirections(
					points.start,
					getLatLngFromStation(startStation),
					getLatLngFromStation(endStation),
					points.end
				);
			})
		});
	}

	var getLatLngFromStation = function(station) {
		return new google.maps.LatLng(station.lat, station.long);
	}


	var ds;
	
	$scope.$on('$viewContentLoaded', function(){
	  	ds = new google.maps.DirectionsService();
	  	loadDataFromContainer();
    });
    
    var loadDataFromContainer = function() {
        var obj = RouteDataContainer.get();
        if(obj === null) {
            return;
        }
        $scope.startText = obj.startText;
        $scope.endText = obj.endText;
        $scope.numPeople = obj.numPeople;
        points.start = obj.routePoints.start;
        points.end = obj.routePoints.end;
    }

	var getApiDirections = function(start, startStation, endStation, end) {
        
        var i = 0;
        
        var routeData = {
            routePoints: {
                'start': start,
                'end': end,
                'startStation': startStation,
                'endStation': endStation
            },
            routeData: {
                'walk1': null,
                'walk2': null,
                'bicycle': null
            }
        };
        
        function getSuccessCallback(key) {
            return function(route) {
                routeData.routeData[key] = route;
                i++;
                if(i == 3) {
                    showRoute(routeData);
                }
            };
        }
        
		getRoute(start, startStation, 'WALKING', ds, getSuccessCallback('walk1'));
		getRoute(startStation, endStation, 'BICYCLING', ds, getSuccessCallback('bicycle'));
		getRoute(endStation, end, 'WALKING', ds, getSuccessCallback('walk2'));
		
	}
	
	function showRoute(routeData) {
	    var obj = angular.extend({}, routeData, {
                'startText': $scope.startText,
                'endText': $scope.endText,
                'numPeople': $scope.numPeople
            });
        RouteDataContainer.set(obj);
        $scope.$apply(function() {
            $location.path('/route');
        });
	}

	var getRoute = function(start, end, travelMode, ds, callback) {
		var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.TravelMode[travelMode]
		};
		ds.route(request, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
                callback(response);
            } else {
                showError('errorShow', 'Error while loading route: ' + response);
            }
		});
	}

	var setCoords = function setCoords(scopeVar, LatLng) {
		points[scopeVar] = LatLng;
	}

	var handlePlaceResult = function handlePlaceResult(scopeVar) {
		return function(placeResult) {
			setCoords(scopeVar, placeResult.geometry.location);
			$scope.$apply(function() {
				$scope[scopeVar + 'Text'] = document.getElementById(scopeVar + 'Autocomplete').value;
			});
		}
	}

	var startAutocomplete = new GoogleAutocomplete(
  		document.getElementById("startAutocomplete"),
  		handlePlaceResult('start'),
  		LondonGeoBounds
  	);

  	var endAutocomplete = new GoogleAutocomplete(
  		document.getElementById("endAutocomplete"),
  		handlePlaceResult('end'),
  		LondonGeoBounds
  	);

  	
  	$scope.useGeoLocation = function useGeoLocation(scopeVar) {
  		GeoLocation.getGeoLocation(
  			function succesfullGeolocation(position) {
  				setCoords(scopeVar,
  					new google.maps.LatLng(
  						position.coords.latitude,
  						position.coords.longitude
  					)
  				);
  				$scope.$apply(function() {
  					$scope[scopeVar + 'Text'] = "your own location";
  				});
  			},
  			function errorFindingGeolocation(error) {
  				showError('errorShow', error);
  			}
  		);
  	};

  	function showError(key, error) {
  		$scope.$apply(function() {
  			$scope[key] = error;
  		});
  	}

}]);