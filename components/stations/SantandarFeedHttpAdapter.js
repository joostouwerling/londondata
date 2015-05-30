angular.module('BikePlanner.stations.SantandarFeedHttpAdapter', [
	'BikePlanner.stations.SantanderFeedUrl'
])

.factory('SantandarFeedHttpAdapter', ['$http', 'SantanderFeedUrl', 
	function SantandarFeedHttpdapter($http, SantanderFeedUrl) {

	/**
	 * Load the station feed from the feed url (SantandarFeedUrl) and transform
	 * the XML response to JSON, before sending it back.
	 * @param  function successCallback the first parameter will be the stations in JSON
	 * @param  function errorCallback   the first parameter will be an error message.
	 */
	var getStations = function getStations(successCallback, errorCallback) {
		$http.get(SantanderFeedUrl)
		.success(function success(data) {
			return convertResponseToJson(data, successCallback, errorCallback);
		})
		.error(function error(data, status) {
			console.error(data);
			errorCallback('[' + status + '] Error while loading data from TFL.');
		});
	}

	/**
	 * Convert the XML response to JSON.
	 * @param  string response        the response in XML
	 * @param  function successCallback the first parameter will be the stations in JSON
	 * @param  function errorCallback   the first parameter will be an error message.
	 */
	var convertResponseToJson = function convertResponseToJson(response, successCallback, errorCallback) {
		if(typeof X2JS === 'undefined') {
			errorCallback('Error: X2JS not loaded.');
		}
		var x2js = new X2JS();
		successCallback(x2js.xml_str2json(response).stations);
	}

	return {
		getStations: getStations
	}

}])