angular.module('BikePlanner.google.DirectionsRendererFactory', [
	'BikePlanner.google.DirectionsRendererWalkingOptions',
	'BikePlanner.google.DirectionsRendererBicyclingOptions'
])

.factory('DirectionsRendererFactory', [
	'DirectionsRendererWalkingOptions',
	'DirectionsRendererBicyclingOptions',
	function(DirectionsRendererWalkingOptions,DirectionsRendererBicyclingOptions) {

	var build = function(travelMode, map, elementName) {
		var options;
		if(travelMode == 'WALKING') {
			options = DirectionsRendererWalkingOptions;
		} else if(travelMode == 'BICYCLING') {
			options = DirectionsRendererBicyclingOptions;
		}
		var dr = new google.maps.DirectionsRenderer(options);
		dr.setMap(map);
		dr.setPanel(document.getElementById(elementName));
		return dr;
	}

	return {
		build: build
	}
}])