var ViewModel = function() {
    var me = this;

    //init properties
    me.map = map;
    me.locations = ko.observableArray([]);
    me.recomendationsResult = ko.observableArray([]);
    me.filter = ko.observable("");
    me.infoWindow = ko.observable(new google.maps.InfoWindow({}));

    //end point for getting data from foursquare
    var url = "https://api.foursquare.com/v2/venues/search";
    //object that represents the params which will be sent to foursquare api
    var params = {};
    //autogenerated token
    params.oauth_token = "2DPQ3O4ITKQJCRO2O5ASTMDLK5H0IKPOBOCAVL1ZLZAVYTAQ";
    params.v = "20151125";
    params.limit = "10";

    me.getContent = function(data) {
        var href = "";
        if (data.url()) {
            href = "<a href='" + data.url() + "'>" + data.url() + "</a>";
        }

        return "<h3>" + data.name() + "</h3></a>" +
            "<p>" + data.address() + "</p>" +
            href +
            "<p>" + data.hereNow() + "</p>";
    };

    //add the listener to all Location Markers 
    me.addListenerToMarkers = function(location) {
        var marker = location.marker();

        bounds.extend(new google.maps.LatLng(location.location().lat, location.location().lng));

        marker.addListener('click', function() {
            me.removeAnimations();
            marker.setAnimation(google.maps.Animation.BOUNCE);
            me.setPanorama(location.location());
            me.searchRecomendations(location);
        });

        google.maps.event.addListener(me.infoWindow(), 'closeclick', function() {
            marker.setAnimation(null);
        });
    };

    //It will show just one InfoWindow in the map 
    me.setInfoWindow = function(content, map, marker) {
        me.infoWindow().setContent(content);
        me.infoWindow().open(map, marker);
    };

    //read the raw locations and push the values in me.markers array
    arrayLocation.forEach(function(data) {
        var location = new Location(data);
        me.locations.push(location);
        me.addListenerToMarkers(location);
    });

    me.map.fitBounds(bounds);

    me.removeRecomendationsMarkers = function() {
        me.recomendationsResult().forEach(function(recomendation) {
            recomendation.marker.setVisible(false);
        });
    };

    me.removeAnimations = function() {
        me.locations().forEach(function(location) {
            location.marker().setAnimation(null);
        });

    };

    //get the filtered values after typing in the input field
    me.filteredLocations = ko.computed(function() {
        me.removeAnimations();
        me.infoWindow().close();

        var result = ko.utils.arrayFilter(this.locations(), function(item) {
            var search ;
            if (search = item.name().toLowerCase().indexOf(me.filter().toLowerCase()) >= 0) {
                item.marker().setVisible(true);
                return search;
            } else {
                item.marker().setVisible(false);
            }
        });

        if (result.length === 0) {
            result.push({
                name: "No results..."
            });
        }

        return result;
    }, me);

    //when click on the left panel related to Locations
    me.focusLocation = function(location) {
        if (location !== null && location.hasOwnProperty("marker")) {
            me.removeAnimations();
            me.removeRecomendationsMarkers();
            me.searchRecomendations(location);
            me.setPanorama(location.location());
        }
    };

    //It is called after you click a location marker
    me.searchRecomendations = function(location) {
        params.ll = location.location().lat + "," + location.location().lng;
        $.ajax({
            method: "GET",
            dataType: "json",
            url: url,
            data: params
        }).
        done(function(data) {
            me.removeRecomendationsMarkers();
            me.recomendationsResult.removeAll();
            var response = data.response;
            if (response !== null) {
                var venues = response.venues;
                var currentLocation = venues[0];

                location.address(currentLocation.location.address);
                location.url(currentLocation.url);
                location.hereNow(currentLocation.hereNow.summary);
                location.marker().setAnimation(google.maps.Animation.BOUNCE);
                me.map.panTo(location.marker().position);

                me.setInfoWindow(me.getContent(location), me.map, location.marker());

                venues.forEach(function(venue) {
                    if (venue !== currentLocation && venue.name !== null && venue.name !== "") {
                        var recomendation = new Recomendation(venue);
                        me.recomendationsResult.push(recomendation);

                        recomendation.marker.addListener('click', function() {
                            me.setOptionsRecomendation(recomendation, recomendation.marker);
                        });

                        google.maps.event.addListener(me.infoWindow(), 'closeclick', function() {
                            recomendation.marker.setAnimation(null);
                        });
                    }
                });
            }
        }).
        fail(function(jqXHR, textStatus) {
            alert("Problems loading foursquare recommendations, pleasy try later");
        });
    };

    me.focusRecomendation = function(recomendation) {
        if (recomendation !== null && recomendation.hasOwnProperty("marker")) {
            me.setOptionsRecomendation(recomendation, recomendation.marker);
        }
    };

    me.setOptionsRecomendation = function(recomendation, marker) {
        me.removeAnimations();
        me.setPanorama(marker.position);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        me.setInfoWindow(me.getContent(recomendation), me.map, marker);
        me.map.panTo(marker.position);
    };

    me.setPanorama = function(position) {
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), {
                position: position,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            });
    };
};


var map;
var panorama;
var bounds;

function initMap(){

    var mapOptions = {
    zoom: 12,
    center: lima,
    rotateControl: true,

    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
    },
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    }
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
            position: lima,
            pov: {
              heading: 34,
              pitch: 10
            }
    });

    bounds = new google.maps.LatLngBounds();
    ko.applyBindings(new ViewModel());

}

function errorMap(){
    alert("Problems loading the map, please try later");
}