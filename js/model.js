"use strict";

//raw data
var arrayLocation = [{
    name: "National Stadium",
    address: "Jose Diaz s/n,Lima 15046",
    phone: "4316190",
    url: "",
    location: {
        lat: -12.067297,
        lng: -77.033582
    }
}, {
    name: "Kenedy Park",
    address: "Diagonal, Lima, Peru",
    phone: "3133773",
    url: "",
    location: {
        lat: -12.120615,
        lng: -77.029627
    }
}, {
    name: "Starbucks",
    address: "Av. José Pardo 297, Miraflores",
    phone: "941 901 940",
    url: "",
    location: {
        lat: -12.119275,
        lng: -77.031756
    }
}, {
    name: "Supermercado Vivanda",
    address: "Av. José Pardo 715,Miraflores Lima 18",
    phone: "6203000",
    url: "",
    location: {
        lat: -12.119329,
        lng: -77.036093
    }
}, {
    name: "Cineplanet",
    address: "Av. Sta. Cruz 814,San Isidro 15073",
    phone: "6249500",
    url: "",
    location: {
        lat: -12.110299,
        lng: -77.037494
    }
}];

//Model for our raw data
var Location = function(data) {
    var me = this;
    me.name = ko.observable(data.name);
    me.address = ko.observable(data.address);
    me.url = ko.observable(data.url);
    me.phone = ko.observable(data.phone);
    me.location = ko.observable(data.location);

    me.content = ko.computed(function() {
        return "<h3>" + me.name() + "</h3></a>" +
            "<p>" + me.address() + "</p>" +
            "<p>" + me.url() + "</p>";
    });

    me.marker = ko.observable(new google.maps.Marker({
        position: new google.maps.LatLng(me.location().lat, me.location().lng),
        animation: google.maps.Animation.DROP,
        name: me.name(),
        address: me.address()
    }));

}

//model for recomedations from foursquare
var Recomendation = function(data) {
    var me = this;
    me.name = ko.observable(data.name);
    me.address = ko.observable("");
    me.url = ko.observable(data.hasOwnProperty("url") ? data.url : "");

    if (data.location !== null && data.location.hasOwnProperty("formattedAddress") && data.location.formattedAddress.length > 0) {
        me.address = ko.observable(data.location.formattedAddress[0] + " - " + data.location.formattedAddress[1]);
    }

    me.lat = ko.observable(data.location.lat);
    me.lng = ko.observable(data.location.lng);
    me.category = ko.observable(data.categories[0].name);

    me.marker = new google.maps.Marker({
        position: new google.maps.LatLng(me.lat(), me.lng()),
        animation: google.maps.Animation.DROP,
        name: me.name(),
        address: me.address()
    });
};