angular.module('BikePlanner.google.GoogleAutocomplete', [])

/**
 * http://blog.revolunet.com/blog/2014/02/14/angularjs-services-inheritance/
 */
.factory('GoogleAutocomplete', function() {

	/**
	 * Constructor for our GoogleAutocomplete object.
	 */
	var GoogleAutocomplete = function(inputElement, callbackChange, geoBounds) {

		/**
		 * Check if Google Maps API is loaded.
		 */
		if(!google.maps) {
			console.error("Fail. Google Maps API not loaded (google.maps not available).");
			return;
		}

		/**
		 * A reference to the HTML input element on which autocomplete is applied.
		 */
		this.inputElement = inputElement;

		/**
		 * The function which will be invoked when the user selects a location. The
		 * first parameter will be a PlaceResult object.
		 *
		 * @see  https://developers.google.com/maps/documentation/javascript/reference#PlaceResult
		 */
		this.callbackChange = callbackChange;

		/**
		 * An object which has the following properties:
		 * - country: an two-letter code for a country
		 * - bounds: a LatLngBounds object
		 *
		 * @see  https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
		 */
		this.geoBounds = geoBounds;

		/**
		 * A holder for the autocomplete object
		 *
		 * @see  https://developers.google.com/maps/documentation/javascript/reference#Autocomplete
		 */
		this.autocomplete = null;

		/**
		 * Initialize the object.
		 */
		this.setupAutocomplete();

	}

	/**
	 * Instantiates the inputElement to be a Google Autocomplete for locations
	 * and places. Uses the geobounds if it is given. Also calls the change
	 * listener setup.
	 */
	GoogleAutocomplete.prototype.setupAutocomplete = function() {
		this.autocomplete = new google.maps.places.Autocomplete(this.inputElement);
		if(this.geoBounds.country) {
			this.autocomplete.setComponentRestrictions({country: this.geoBounds.country});
		}
		if(this.geoBounds.bounds) {
			this.autocomplete.setBounds(this.geoBounds.bounds);
		}
		this.setupChangeListener();
	}

	/**
	 * Set up the listener for a change in the autocomplete field. Calls the 
	 * callback with a PlaceResult object as the first parameter.
	 *
	 * @see  https://developers.google.com/maps/documentation/javascript/reference#PlaceResult
	 */
	GoogleAutocomplete.prototype.setupChangeListener = function () {
		var self = this; // the callback has it's own this.
		google.maps.event.addListener(	this.autocomplete, 
										'place_changed', 
										function() {
											self.callbackChange(self.autocomplete.getPlace())
										}
									);
	}

	/**
	 * Return the autocomplete object
	 * @return Autocomplete
	 * @see https://developers.google.com/maps/documentation/javascript/reference#Autocomplete
	 */
	GoogleAutocomplete.prototype.getAutocomplete = function() {
		return this.autocomplete;
	}

	return GoogleAutocomplete;

});