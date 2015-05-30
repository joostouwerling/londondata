angular.module('BikePlanner.stations.SantandarBicycleStations', [
	'BikePlanner.stations.SantandarFeedHttpAdapter',
	'LocalStorageModule'
])

.factory('SantandarBicycleStations', ['SantandarFeedHttpAdapter', 'localStorageService',
	function SantandarBicycleStations(SantandarFeedHttpAdapter, localStorageService) {

	/**
	 * The localstorage key where the statios will be cached.
	 */
	var localstorageKey = 'santandarStations';

	/**
	 * Get the feed with the bicycle stations in it. The format will be:
	 * {
	 * 	_lastUpdate: time the feed was updated for the last time,
	 *  _version: version of the feed,
	 *  station: [
	 * 		id, name, terminalName, lat, long, installed, locked, installDate, 
	 * 	 removalDate, temporary, nbBikes, nbEmptyDocks, nbDocks
	 *  ]
	 * }
	 * @param  function successCallback the first parameter will be the stations
	 * @param  function errorCallback   the first parameter will be an error message.
	 */
	var getBicycleStations = function getBicycleStations(successCallback, errorCallback) {
		var stations = getFeedFromLocalstorage();
		if(stations != null) {
			successCallback(stations);
			return;
		}
		SantandarFeedHttpAdapter.getStations(
			function(stations) {
				saveLocalstorage(stations);
				successCallback(stations);
			},
			errorCallback
		);
	}

	/**
	 * Get the feed with bicycle stations from the local storage, i.e. 
	 * temporary storage on the users' machine. For detailed information about
	 * the format of the feed, see the comments for getBicycleStations.
	 * @return stationsList  if there is an up 2 date (< 4 min old) copy
	 *                       of the feed available in local storage. otherwise
	 *                       it returns null.
	 */
	var getFeedFromLocalstorage = function getFeedFromLocalstorage() {
		if(!localStorageService.isSupported) {
			return null;
		}
		var stations = localStorageService.get(localstorageKey);
		if(stations == null) {
			return null;
		}
		// Keep the feed 190s in the cache
		if((Date.now() - stations._lastUpdate) > 190000) {
			return null;
		}
		return stations;
	}

	/**
	 * Save stations in localstorage, after it has been loaded from the feed.
	 * @param  stations the json array with santandar stations.
	 */
	var saveLocalstorage = function saveLocalstorage(stations) {
		if(!localStorageService.isSupported) {
			return;
		}
		localStorageService.set(localstorageKey, stations);
	}

	return {
		getBicycleStations: getBicycleStations
	};

}])