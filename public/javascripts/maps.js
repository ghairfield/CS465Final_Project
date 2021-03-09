let mapsRendered = false;
let haveCurrentLocation = false;
let map;
let autoCompleteDestination;
let autoCompleteSource;
let directionService;
let directionRenderer;
let markers = [];

let currentLocation = {
    center: { 
      lat: 45.511200, 
      lng: -122.683456 
    },
    zoom: 15,
};

let destination = {
  center: {
    lat: 0.0,
    lng: 0.0
  },
  zoom: 12,
}

initMap = () => {
  if (google.maps)
    mapsRendered = true;

  // Map object
  map = new google.maps.Map(document.getElementById("map"), currentLocation);
  // Direction services
  directionService = new google.maps.DirectionsService();
  directionRenderer = new google.maps.DirectionsRenderer();
  directionRenderer.setPanel(document.getElementById("directionPanel"));
  directionRenderer.setMap(map);

  /* Get the user's current location */
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(currentLocation.center);
        haveCurrentLocation = true;
      }
    )
  }

  /* Set up the auto complete for the destination */
  const dest = document.getElementById("destination");
  const source = document.getElementById("starting");
  const options = {
    componentRestrictions: { country: "us" },
    origin: currentLocation.center,
    strictBounds: false,
    types: ['address']
  }
  autoCompleteDestination = new google.maps.places.Autocomplete(dest, options);
  autoCompleteSource = new google.maps.places.Autocomplete(source, options);

  if (map) {
    mapsRendered = true;
  }
}

$(document).ready(function() {

  $( 'form' ).submit(function(event) {
    let str = $( '#destination' ).val();
    event.preventDefault();

    let request = {
      origin: currentLocation.center,
      destination: str,
      travelMode: 'DRIVING'
    };

    directionService.route(request, function(result, status) {
      if (status === 'OK') {
        directionRenderer.setDirections(result);
      } else {
        console.log('Could not render directions: ' + status);
      }
    })
  });

  $( '#addmarker' ).click(function() {
    console.log('Marker requested');
    let marker = new google.maps.Marker({
      position: map.getCenter(),
      map,
      title: "Marker " + (markers.length + 1),
      draggable: true,
    });
    google.maps.event.addListener(marker, 'dragend', function(event) {
        console.log('Drag ended: ' + event.latLng.lat() + ' ' + event.latLng.lng());
    });

    markers.push(marker);
  });
})

