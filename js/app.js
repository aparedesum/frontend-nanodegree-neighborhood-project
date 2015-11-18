"use strict";

var locations = [{
    name: "National Stadium",
    address: "Jose Diaz s/n,Lima 15046",
    location: {
        lat: -12.067297,
        lng: -77.033582
    }
}, {
    name: "Kenedy Park",
    address: "Diagonal, Lima, Peru",
    location: {
        lat: -12.120615,
        lng: -77.029627
    }
}, {
    name: "Starbucks",
    adress: "Av. José Pardo 297, Miraflores",
    location: {
        lat: -12.119275,
        lng: -77.031756
    }
}, {
    name: "Supermercado Vivanda",
    adress: "Av. José Pardo 715,Miraflores Lima 18",
    location: {
        lat: -12.119329,
        lng: -77.036093
    }
}, {
    name: "Cineplanet",
    adress: "Av. Sta. Cruz 814,San Isidro 15073",
    location: {
        lat: -12.110299,
        lng: -77.037494
    }
}];

var ViewModel = function() {
    var me = this;
    me.markers = ko.observableArray([]);
    
    var lima = {
        lat: -12.046374,
        lng: -77.042793
    };

    me.map = new google.maps.Map(document.getElementById('map'), {
        center: lima,
        zoom: 12
    });


    

    locations.forEach(function(data) {

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.location.lat, data.location.lng),
            map: me.map,
            animation: google.maps.Animation.DROP,
            name: data.name,
            address: data.address
        });

        marker.addListener('click', function() {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        });

        me.markers.push(marker);
    });

    console.log(me.markers());

};

ko.applyBindings(new ViewModel());