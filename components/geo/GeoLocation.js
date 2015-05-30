angular.module('BikePlanner.geo.GeoLocation', [])

/**
 * A service for using the browser's GeoLocation. It detects the availability
 * of the geolocation in the browser and gives an error if it can't be used.
 */
.factory('GeoLocation', function GeoLocation() {

	/**
	 * GeoLocation settings. More information,
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
	 */
	var settings = 	{
  		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
  	};

  	/**
  	 * Check whether the geolocation is available.
  	 * @return Boolean true if geolocation is available, otherwise false.
  	 */
	var isAvailable = function isAvailable() {
		return ("geolocation" in navigator);
	}

	/**
	 * Get the geolocation from the browser. Method takes a callback for the 
	 * success scenario and for the error situation.
	 * @param  function success Callback for successfully using geolocation.
	 *                          The first and only parameter is a Position object.
	 * @param  function error   Callback for failure. Takes one argument, an error message.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Position
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
	 */
	var getGeoLocation = function getGeoLocation(success, error) {
		if(!isAvailable()) {
			error('Geolocation is not available.');
		}
		navigator.geolocation.getCurrentPosition(
			success,
			function(posError) {
				error(posError.message)
			},
			settings
		);
	}

	return {
		isAvailable: isAvailable,
		getGeoLocation: getGeoLocation
	};

})