angular.module('BikePlanner.stations.NearestStationService', [])


/**
 * A service which returns the nearest station based on an origin lat lng.
 * The five stations which are nearest to the origin, based on how the bird
 * flies, are determined in the browser. Then Google's distance matrix service
 * is used to determine the nearest station in travelling time. This is done to
 * prevent having to walk to the other side of the river, for example.
 *
 * @see  https://developers.google.com/maps/documentation/javascript/distancematrix
 */
.factory('NearestStationService', function(){

	/**
	 * The function that has to be called to get the nearest station.
	 * @param  LatLng 		origin   	Google LatLng object of the origin
	 * @param  array  		stations 	Array with the stations from Santandar API,
	 *                            		as retrieved with SantandarBicycleStations service
	 * @param  Boolean		isStart  	Boolean, false for the start station,
	 *                             		false for the end station.	 
	 * @param  integer		numPeople 	Number of people
	 * @param  function  	success  	Callback for a succesfull calculation.
	 *                              	First param will be the station object.
	 * @param  function 	error    	Error callback with an error message.
	 */
	var getNearestStation = function (origin, stations, isStart, numPeople, success, error) {
		var fiveNearest = calculateFiveNearest(origin, stations, isStart, numPeople);
		if(fiveNearest.length == 0) {
			error('No bicycle stations can be found. Try less people.');
			return;
		}
		getDistanceMatrix(
			origin, fiveNearest,
			function(distanceMatrix) {
				/* Extract the nearest station from the distance matrix. */
				extractNearest(
					distanceMatrix,
					/* return the correct station */
					function(index) {
						success(stations.station[fiveNearest[index].index]);
					},
					error
				);
			},
			error
		);
	}

	/**
	 * Extract the nearest station from the distance matrix.
	 * @param  DistanceMatrix 	distanceMatrix 	A DistanceMatrixResponse object
	 * @param  function 		success        	success callback which returns the
	 *                                   		index of the nearest station in the
	 *                                   		response.
	 * @param  function 		error          	error callback which takes a message.
	 */
	var extractNearest = function (distanceMatrix, success, error) {
		if(distanceMatrix.rows.length == 0 || distanceMatrix.rows[0].elements.length == 0) {
			error('Distance matrix did not return any results.');
		}
		var minIndex = null;
		var minValue = Number.POSITIVE_INFINITY;
		for(var i = 0; i < distanceMatrix.rows[0].elements.length; i++) {
			if(distanceMatrix.rows[0].elements[i].status == 'OK' && distanceMatrix.rows[0].elements[i].duration.value < minValue) {
				minIndex = i;
				minValue = distanceMatrix.rows[0].elements[i].duration.value;
			}
		}
		if(minIndex == null) {
			error('Distance matrix did not return any valid elements.');
		}
		success(minIndex);
	}

	/**
	 * Calculate the five nearest stations starting at originLatLng. Return 
	 * them in an array. 
	 */
	var calculateFiveNearest = function(originLatLng, stations, isStart, numPeople) {
		var locations = [];
		var maximum = null;
		for(var i = 0; i < stations.station.length; i++) {

			/* no valid station? no analysis! */
			if(!isValidStation(stations.station[i], isStart, numPeople)) {
				continue;
			}
			var StationLatLng = new google.maps.LatLng(
										stations.station[i].lat,
									   stations.station[i].long
									);
			var distance = google.maps.geometry.spherical.computeDistanceBetween(originLatLng, StationLatLng);

			/* If there are not yet 5 locations, simply push. */
			if(locations.length < 5) {
				locations.push({'latlng': StationLatLng, 'distance': distance, 'index': i});
				if(maximum == null || distance > maximum) {
					maximum = distance;
				}
			/* check if the distance is smaller than the max. If so, do a replace. */
			} else {
				if(distance < maximum) {
					locations[findMaximum(locations).index] = {'latlng': StationLatLng, 'distance': distance, 'index': i};
					maximum = findMaximum(locations).distance;
				}
			}
		}
		return locations;
	}

	/**
	 * Check if a station is a valid station. That means, it is installed,
	 * not locked, and there are resp. bikes available or slots available.
	 */
	var isValidStation = function(station, isStart, numPeople) {
		var validStation = station.installed == 'true' && station.locked == 'false';
		if(isStart) {
			return validStation = validStation && parseInt(station.nbBikes) >= numPeople;
		} else {
			return validStation = validStation && parseInt(station.nbEmptyDocks) >= numPeople;
		}	
	}

	/**
	 * Find the maximum index and value in the locations array.
	 */
	var findMaximum = function(locations) {
		var maxIndex = 0;
		var maxDistance = locations[0].distance;
		for(var i = 1; i < locations.length; i++) {
			if(locations[i].distance > maxDistance) {
				maxIndex = i;
				maxDistance = locations[i].distance;
			}
		}
		return {
			index: maxIndex,
			distance: maxDistance
		}
	}			

	/**
	 * Get the distance matrix from Google's api, starting at originLatLng to
	 * all stations in stations. Success will be called on success with a
	 * DistanceMatrixResponse object. On failure, error will be called with an error message.
	 */
	var getDistanceMatrix = function(originLatLng, stations, success, error) {
		var locs = [];
		for(var i = 0; i < stations.length; i++) {
			locs.push(stations[i].latlng)
		}
		var dm = new google.maps.DistanceMatrixService();
		dm.getDistanceMatrix(
			{
				origins: [originLatLng],
				destinations: locs,
				travelMode: google.maps.TravelMode.WALKING,
      			unitSystem: google.maps.UnitSystem.METRIC,
			},
			function(response, status) {
				if(status == 'OK') {
					success(response);
				} else {
					error('Error in fetching the distance matrix: ' + status)
				}
			}
		);
	}

	return {
		getNearestStation: getNearestStation
	}

})