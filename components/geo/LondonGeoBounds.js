angular.module('BikePlanner.geo.LondonGeoBounds', [])

/**
 * A constant for binding the autocomplete to London.
 */
.constant('LondonGeoBounds', {
    country: 'uk',
    bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng( 51.28, -0.489 ), 
        new google.maps.LatLng( 51.686, 0.236 )
  	)
})