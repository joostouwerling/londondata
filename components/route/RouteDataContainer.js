angular.module('BikePlanner.route.RouteDataContainer', [])

/**
 * Data should have the following objects
 * - startText
 * - endText
 * - numPeople
 * - routePoints {
 *  - start (LatLng)
 *  - end (LatLng)
 *  - startStation (LatLng)
 *  - endStation (LatLng)
 *  }
 * - routeData {
 *  - walk1
 *  - bicycle
 *  - walk2
 * }
 */
.factory('RouteDataContainer', function() {
    
    var data = null;
    
    var setData = function setData(dataObj) {
        data = dataObj;
    };
    
    var getData = function getData() {
        return data;
    };
    
    var getKey = function getKey(key) {
        if(data === null || !data.hasOwnProperty(key)) {
            return null;
        }
        return data[key];
    };
    
    return {
        set: setData,
        get: getData,
        getKey: getKey
    };
    
});