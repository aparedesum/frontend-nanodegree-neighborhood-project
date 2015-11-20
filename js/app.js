"use strict";

//raw data
var locations = [{
    name: "National Stadium",
    address: "Jose Diaz s/n,Lima 15046",
    phone: "4316190",
    location: {
        lat: -12.067297,
        lng: -77.033582
    }
}, {
    name: "Kenedy Park",
    address: "Diagonal, Lima, Peru",
    phone: "3133773",
    location: {
        lat: -12.120615,
        lng: -77.029627
    }
}, {
    name: "Starbucks",
    address: "Av. José Pardo 297, Miraflores",
    phone: "941 901 940",
    location: {
        lat: -12.119275,
        lng: -77.031756
    }
}, {
    name: "Supermercado Vivanda",
    address: "Av. José Pardo 715,Miraflores Lima 18",
    phone: "6203000",
    location: {
        lat: -12.119329,
        lng: -77.036093
    }
}, {
    name: "Cineplanet",
    address: "Av. Sta. Cruz 814,San Isidro 15073",
    phone: "6249500",
    location: {
        lat: -12.110299,
        lng: -77.037494
    }
}];

//Model
var Location = function(data) {
    var me = this;
    me.name = ko.observable(data.name);
    me.address = ko.observable(data.address);
    me.phone = ko.observable(data.phone);
    me.location = ko.observable(data.location);

    me.content = ko.computed(function() {
        return "<h3>" + me.name() + "</h3></a>" +
            "<p>" + me.address() + "</p>" +
            "<p>" + me.phone() + "</p>";
    });

    me.infowindow = ko.observable(new google.maps.InfoWindow({content: me.content()}));


    me.marker = ko.observable(new google.maps.Marker({
            position: new google.maps.LatLng(me.location().lat, me.location().lng),
            map: me.map,
            animation: google.maps.Animation.DROP,
            name: me.name(),
            address: me.address()
    }));

}

var ViewModel = function() {
    var me = this;

    //center the map in this position
    var lima = {
        lat: -12.046374,
        lng: -77.042793
    };

    me.markers = ko.observableArray([]);
    me.filter = ko.observable("");

    me.map = new google.maps.Map(document.getElementById('map'), {
        center: lima,
        zoom: 12
    });

    //add the listener to all Markers
    me.addListenerToMarkers = function(item) {
        var marker = item.marker();
        
        marker.addListener('click', function() {
            item.infowindow().open(me.map, marker);

            if (item.marker().getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        });
    };

    //read the locations array and push the values in me.markers array
    locations.forEach(function(data) {
        var item = new Location(data);
        me.markers.push(item);
        me.addListenerToMarkers(item);
    });

    me.setMapOnAll = function(map) {
        ko.utils.arrayForEach(me.markers(), function(item) {
            item.marker().setMap(map);
        });
    };

    me.clearMarkers = function() {
        me.setMapOnAll(null);
    };

    //get the filtered values after typing in the input tag
    me.filteredMarkers = ko.computed(function() {
        var filter = me.filter().toLowerCase();        
        me.clearMarkers();
        
        var result = [];
        if (!filter) {            
            result = me.markers();
        } else {
            result = ko.utils.arrayFilter(this.markers(), function(item) {
                return item.name().toLowerCase().indexOf(filter.toLowerCase()) !== -1;
            });
        }

        result.forEach(function(data){
            data.marker().setMap(me.map);
        });

        return result;
    }, me);
};


ko.applyBindings(new ViewModel());