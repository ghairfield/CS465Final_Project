let mapsRendered = false;
let haveCurrentLocation = false;
let map;
let autoCompleteDestination;
let autoCompleteSource;
let directionService;
let directionRenderer;
let markers = [];
let infowindow;
let currentLocation = {
  center: {
    lat: 45.5112,
    lng: -122.683456,
  },
  zoom: 15,
};
let destination = {
  center: {
    lat: 0.0,
    lng: 0.0,
  },
  zoom: 12,
};
initMap = () => {
  if (google.maps) mapsRendered = true;
  // Map object
  map = new google.maps.Map(document.getElementById("map"), currentLocation);
  // Direction services
  directionService = new google.maps.DirectionsService();
  directionRenderer = new google.maps.DirectionsRenderer();
  directionRenderer.setPanel(document.getElementById("directionPanel"));
  directionRenderer.setMap(map);
  infowindow = new google.maps.InfoWindow();
  /* Get the user's current location */
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentLocation.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map.setCenter(currentLocation.center);
      haveCurrentLocation = true;
    });
  }
  /* Set up the auto complete for the destination */
  const dest = document.getElementById("destination");
  const source = document.getElementById("starting");
  const options = {
    componentRestrictions: { country: "us" },
    origin: currentLocation.center,
    strictBounds: false,
    types: ["address"],
  };
  autoCompleteDestination = new google.maps.places.Autocomplete(dest, options);
  autoCompleteSource = new google.maps.places.Autocomplete(source, options);
  if (map) {
    mapsRendered = true;
  }
};
$(document).ready(function () {
  $("form").submit(function (event) {
    let str = $("#destination").val();
    event.preventDefault();
    let request = {
      origin: currentLocation.center,
      destination: str,
      travelMode: "DRIVING",
    };
    directionService.route(request, function (result, status) {
      if (status === "OK") {
        directionRenderer.setDirections(result);
        $("#directionPanel").addClass("bg-light");
      } else {
        console.log("Could not render directions: " + status);
      }
    });
  });
  $("#addmarker").click(function () {
    console.log("Marker requested");
    let marker = new google.maps.Marker({
      position: map.getCenter(),
      map,
      title: "Marker " + (markers.length + 1),
      draggable: true,
      icon: { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
    });
    google.maps.event.addListener(marker, "dragend", function (event) {
      let request = {
        location: { lat: event.latLng.lat(), lng: event.latLng.lng() },
        radius: "500",
        type: ["restaurant"],
      };
      let service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, servicesCallBack);
      infowindow = new google.maps.InfoWindow();
    });
    markers.push(marker);
  });

  function servicesCallBack(results, status) {
    console.log("in here");
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; ++i) {
        createMarker(results[i]);
      }
    }
  }
  function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const marker = new google.maps.Marker({
      map,
      position: place.geometry.location,
    });
    google.maps.event.addListener(marker, "click", () => {
      infowindow.open(map, marker);
    });
  }
});
