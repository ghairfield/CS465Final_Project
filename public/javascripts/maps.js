let mapsRendered = false;
let haveCurrentLocation = false;
let map;
let autoCompleteDestination;
let autoCompleteSource;
let directionService;
let directionRenderer;
let service;
let markers = [];
let infowindow;
let currentInfoWindow;
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

  infoPane = document.getElementById("panel");

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

  //on click - for way marker
  $("#addmarker").click(function () {
    console.log("Marker requested");
    let marker = new google.maps.Marker({
      position: map.getCenter(),
      map,
      title: "Marker " + (markers.length + 1),
      draggable: true,
      icon: { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
    });

    //get value from checkbox
    var val = $("input[type=checkbox][clicked=true]").val();
    console.log("value : " + val);

    //get radius value
    var radius_var = $("#radius_options").val();
    console.log("radius : " + radius_var);

    //nearby search request
    google.maps.event.addListener(marker, "dragend", function (event) {
      let request = {
        location: { lat: event.latLng.lat(), lng: event.latLng.lng() },
        radius: radius_var,
        type: [val],
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, servicesCallBack);
      infowindow = new google.maps.InfoWindow();
    });

    markers.push(marker);
  });

  $("form input[type=checkbox]").click(function () {
    $("input[type=checkbox]", $(this).parents("form")).removeAttr("clicked");
    $(this).attr("clicked", "true");
  });

  // call create marker for each search result
  function servicesCallBack(results, status) {
    console.log("in services callback");
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; ++i) {
        createMarker(results[i]);
      }
    }
  }

  //create marker for each search result
  function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const marker = new google.maps.Marker({
      map,
      position: place.geometry.location,
      title: place.name,
    });

    google.maps.event.addListener(marker, "click", () => {
      let request = {
        placeId: place.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "website",
          "photos",
        ],
      };
      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status);
      });
    });
  }

  function showDetails(placeResult, marker, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      let placeInfowindow = new google.maps.InfoWindow();
      placeInfowindow.setContent(
        "<div><strong>" +
          placeResult.name +
          "</strong><br>" +
          "Rating: " +
          placeResult.rating +
          "</div>"
      );
      placeInfowindow.open(marker.map, marker);

      showPanel(placeResult);
    } else {
      console.log("showDetails failed: " + status);
    }
  }

  //function not working- supposed to display a pannel showing
  //information for each search result information

  function showPanel(placeResult) {
    // If infoPane is already open, close it
    /*  if (infoPane.classList.contains("open")) {
      infoPane.classList.remove("open");
    }*/

    // Clear the previous details
    /* if (infoPane.lastChild) {
      while (infoPane.lastChild) {
        infoPane.removeChild(infoPane.lastChild);
      }
    }*/

    let name = document.createElement("h1");
    name.classList.add("place");
    name.textContent = placeResult.name;
    //infoPane.appendChild(name);
    if (placeResult.rating != null) {
      let rating = document.createElement("p");
      rating.classList.add("details");
      rating.textContent = `Rating: ${placeResult.rating} \u272e`;
      //infoPane.appendChild(rating);
    }
    let address = document.createElement("p");
    address.classList.add("details");
    address.textContent = placeResult.formatted_address;
    //infoPane.appendChild(address);
    if (placeResult.website) {
      let websitePara = document.createElement("p");
      let websiteLink = document.createElement("a");
      let websiteUrl = document.createTextNode(placeResult.website);
      websiteLink.appendChild(websiteUrl);
      websiteLink.title = placeResult.website;
      websiteLink.href = placeResult.website;
      websitePara.appendChild(websiteLink);
      //infoPane.appendChild(websitePara);
    }

    // Open the infoPane
    //infoPane.classList.add("open");
  }
});
