"use strict";

//raw data
var arrayLocation = [{
    name: "National Stadium",   
    location: {
        lat: -12.067297,
        lng: -77.033582
    }
}, {
    name: "Kenedy Park",
    location: {
        lat: -12.120615,
        lng: -77.029627
    }
}, {
    name: "Starbucks",
    location: {
        lat: -12.119275,
        lng: -77.031756
    }
}, {
    name: "Supermercado Vivanda",
    location: {
        lat: -12.119329,
        lng: -77.036093
    }
}, {
    name: "Cineplanet",
    location: {
        lat: -12.110299,
        lng: -77.037494
    }
}];

var lima = {
        lat: -12.046374,
        lng: -77.042793
};

//Model for our raw data
var Location = function(data) {
    var me = this;
    me.name = ko.observable(data.name);
    me.address = ko.observable("");
    me.url = ko.observable("");
    me.hereNow = ko.observable("");
    me.location = ko.observable(data.location);    

    me.marker = ko.observable(new google.maps.Marker({
        position: new google.maps.LatLng(me.location().lat, me.location().lng),
        animation: google.maps.Animation.DROP,
        map: map
    }));

};

//model for recomedations from foursquare
var Recomendation = function(data) {
    var me = this;
    me.name = ko.observable(data.name);
    me.address = ko.observable("");
    if(data.hasOwnProperty("location") && data.location.hasOwnProperty("address")){
        me.address(data.location.address);    
    }
    
    me.url = ko.observable(data.url);
    me.lat = ko.observable(data.location.lat);
    me.lng = ko.observable(data.location.lng);
    
    me.hereNow = ko.observable(data.hereNow.summary);
    me.marker = new google.maps.Marker({
        position: new google.maps.LatLng(me.lat(), me.lng()),
        animation: google.maps.Animation.DROP,
        map: map
    });
};