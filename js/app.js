"use strict";

//raw data
var arrayLocation = [{
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

    me.marker = ko.observable(new google.maps.Marker({
            position: new google.maps.LatLng(me.location().lat, me.location().lng),
            map: me.map,
            animation: google.maps.Animation.DROP,
            name: me.name(),
            address: me.address()
    }));

}

var Recomendation = function(data){
    var me = this;
    me.name = ko.observable(data.name);
    me.url = ko.observable(data.url);
    me.address = ko.observable("");
    
    if(data.location !== null && data.location.formattedAddress !== null){
        me.address = ko.observable(data.location.formattedAddress[0] + " - " + data.location.formattedAddress[1]);
    }

    me.category = ko.observable(data.categories[0].name);
};

var ViewModel = function() {
    var me = this;

    //center the map in this position
    var lima = {
        lat: -12.046374,
        lng: -77.042793
    };

    //init properties
    me.locations = ko.observableArray([]);
    me.filter = ko.observable("");
    me.infoWindow = ko.observable(new google.maps.InfoWindow({}));
    me.recomendationsResult = ko.observableArray([]);

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
    }

    me.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    //add the listener to all Markers
    me.addListenerToMarkers = function(location) {
        var marker = location.marker();
        
        marker.addListener('click', function() {
            me.cleanAnimations();
            marker.setAnimation(google.maps.Animation.BOUNCE);
            me.setInfoWindow(location.content(), me.map, marker);            
            me.map.panTo(marker.position);
            me.invokeRecomendations(location);
        });

        google.maps.event.addListener(me.infoWindow(),'closeclick',function(){
            marker.setAnimation(null);          
        });
    };

    me.setInfoWindow = function(content, map, marker){
            me.infoWindow().setContent(content);
            me.infoWindow().open(map, marker);
    };

    //read the locations array and push the values in me.markers array
    arrayLocation.forEach(function(data) {
        var location = new Location(data);
        me.locations.push(location);
        me.addListenerToMarkers(location);
    });

    me.setMapOnAll = function(map) {
        ko.utils.arrayForEach(me.locations(), function(location) {
            location.marker().setMap(map);
        });
    };

    me.clearMarkers = function() {
        me.setMapOnAll(null);
    };

    //get the filtered values after typing in the input tag
    me.filteredLocations = ko.computed(function() {
        var filter = me.filter().toLowerCase();        
        me.clearMarkers();
        me.setInfoWindow(null, null, null);                

        var result = [];

        if (!filter) {            
            result = me.locations();
        } else {
            result = ko.utils.arrayFilter(this.locations(), function(item) {
                return item.name().toLowerCase().indexOf(filter.toLowerCase()) !== -1;
            });
        }

        if(result.length===0){
            result.push({name:"No results..."});
        } else {
            result.forEach(function(data){
                data.marker().setMap(me.map);
            });
        }    

        return result;
    }, me);

   me.cleanAnimations = function (){
        me.locations().forEach(function(location) {
            location.marker().setAnimation(null);
        });
   }
   
    me.focusLocation = function(location) {        
        if( location!==null && location.hasOwnProperty("marker")){        
            me.cleanAnimations();
            me.setInfoWindow(location.content(), me.map, location.marker());
            me.map.panTo(location.marker().position);
            location.marker().setAnimation(google.maps.Animation.BOUNCE);
            me.invokeRecomendations(location);
        }
  };

  me.invokeRecomendations = function(location){
            var url = "https://api.foursquare.com/v2/venues/search";
            
            var params = {};

            params.ll=location.location().lat+","+location.location().lng;
            //autogenerated token
            params.oauth_token ="2DPQ3O4ITKQJCRO2O5ASTMDLK5H0IKPOBOCAVL1ZLZAVYTAQ";
            params.v ="20151125";
            params.limit = "10";
                        
            var request = $.ajax({
                method:"GET",
                dataType: "json",
                url: url,
                data: params
            }).
            done(function(data) {
              me.successFromRecomendations(data);                
            }).
            fail(function( jqXHR, textStatus ) {                
             me.failureFromRecomendations(jqXHR, textStatus);
            });
  };

  me.successFromRecomendations = function (data){
    if(data.response!==null){
        var recomendatiosContainer = $("#listRecomendations");
        recomendatiosContainer.empty();
        var venues = data.response.venues;
        //me.recomendationsResult = ko.observableArray([]);

        venues.forEach(function(venue){

            //me.recomendationsResult.push();
            var recomendation = new Recomendation(venue);
            recomendatiosContainer.append("<li>"+recomendation.name()+"</li>");

        });


    }
    
  };

  me.failureFromRecomendations = function (jqXHR, textStatus){
    alert( "Problems loading foursquare recommendations, pleasy try later");
  };

 me.focusRecomendation = function(location) {        
        /*if( location!==null && location.hasOwnProperty("marker")){        
            me.cleanAnimations();
            me.setInfoWindow(location.content(), me.map, location.marker());
            me.map.panTo(location.marker().position);
            location.marker().setAnimation(google.maps.Animation.BOUNCE);
            me.invokeRecomendations(location);
        }*/
  };

};

ko.applyBindings(new ViewModel());