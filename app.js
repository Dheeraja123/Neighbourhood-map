var koViewModel = function() {
  "use strict";
  var self = this;

  var bounds = new google.maps.LatLngBounds();

  // Construct the Google Map.
  self.googleMap = new google.maps.Map(document.getElementById('map'), {
  });

  // Build "Place" objects from locationData object.
  self.allPlaces = [];
  locationData.forEach(function(place) {
    self.allPlaces.push(new Place(place));
  });

  // Place constructor function.
  function Place(dataObject) {
    this.Last = dataObject.Last;
    this.latLng = dataObject.latLng;
    this.Year = dataObject.Year;
    this.latitude = dataObject.Latitude;
    this.longitude = dataObject.Longitude;
  }
  
  // Set infowindow
  var contentStringStart = '<div id="content" style="width:200px;height:200px;"><h5>Closest High School:</h5><p id="fourSquareData">';
  var contentStringEnd = '</p></div>';
  var infowindow = new google.maps.InfoWindow({
    content: contentStringStart + contentStringEnd
  });
  
  // Build Markers via the Maps API and place them on the map.
  self.allPlaces.forEach(function(place) {
    var markerOptions = {
      map: self.googleMap,
      position: place.latLng

    };
    
    place.marker = new google.maps.Marker(markerOptions);
    bounds.extend(place.marker.position);


    google.maps.event.addListener(place.marker, 'click', function() {
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
	  place.marker.setIcon('https://www.google.com/mapfiles/marker_green.png');
      window.setTimeout(function() {
        place.marker.setAnimation(null);
		place.marker.setIcon(null);
	
		
      }, 2100);
      infowindow.open(self.googleMap, place.marker);
	  infowindow.setContent('');

      // Yelp API information.
      var clientID = 'V0PUHF1XZANCJE0MAVJLK3XLREGGC5BMBC0ZBTDHTPOM03YO';     
	  var clientSecret = '3Y40MVFAP0FJUXXFZWI3GBOYQBJ53LPSCV50KVFYXQDI0BNM';

      var fourSquareUrl = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&ll=' + place.latitude +',' + place.longitude + '&query=highschool&v=20151210';
	  
	  
      // AJAX request.
      $.getJSON(fourSquareUrl, function(data) {
          infowindow.setContent(contentStringStart + data.response.venues[0].name + contentStringEnd);
        }).error(function() { alert("Please check your internet connection and try again."); });
    });

    google.maps.event.addListener(infowindow, 'closeclick', function(){
		
    });

    //This function is triggered when a list item is clicked.
    self.openInfoWindow = function() {
      google.maps.event.trigger(this.marker, 'click');
    };
  });

  self.googleMap.fitBounds(bounds);

  // This array contains places that should show as markers on the map (based on user input).
  self.visiblePlaces = ko.observableArray();
  
  
  // Initialize map with all places.
  self.allPlaces.forEach(function(place) {
    self.visiblePlaces.push(place);
  });
  
  
  // This observable tracks user input in the search field.
  self.userInput = ko.observable('');
  
  
  // This filter compares the userInput observable to the visisblePlaces array.
  // Non-matching places are filtered off of the map.
  self.filterMarkers = function() {
    var searchInput = self.userInput().toLowerCase();
    
    self.visiblePlaces.removeAll();
    
    // This looks at the name of each place and then determines if the user
    // input can be found within the place name.
    self.allPlaces.forEach(function(place) {
      place.marker.setVisible(false);
      
      if (place.Last.toLowerCase().indexOf(searchInput) !== -1) {
        self.visiblePlaces.push(place);
      }
    });
    
    self.visiblePlaces().forEach(function(place) {
      place.marker.setVisible(true);
    });
  };

  self.menuToggled = ko.observable(false);

  self.toggleMenu = function() {
  // Is the menu currently open?
  if (self.menuToggled() === true) {
    self.menuToggled(false); // close the menu
  } else {
    self.menuToggled(true); // open the menu
  }
};

};

function initMap() {
  ko.applyBindings(new koViewModel());
}
