// Ticketmaster API Key
const TM_API_KEY = "YOUR_TICKETMASTER_API_KEY_HERE";

// Array to store events
var events = [];
var currentEvent = null;

// Auto load when home page opens
$(document).on("pageshow", "#home", function () {
  getLocation();
});

// Refresh button
$(document).on("click", "#refresh", function (e) {
  e.preventDefault();
  getLocation();
});

// Handle click on list item -> show details
$(document).on("pagebeforeshow", "#home", function () {
  $(document).off("click", ".to_details");
  $(document).on("click", ".to_details", function (e) {
    e.preventDefault();
    var index = $(this).data("index");
    currentEvent = events[index];
    $.mobile.changePage("#details");
  });
});

// Populate list of events near the user
function PopulateList(lat, lon) {
  const radius = 100; // search radius
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TM_API_KEY}&latlong=${lat},${lon}&radius=${radius}`;

  $.getJSON(url, function (data) {
    events = data._embedded.events || [];

    // Clear the previous list
    $("#places_list li").remove();

    // Add events to the list
    $.each(events, function (index, event) {
      const name = event.name;
      const distance = event.distance ? event.distance.toFixed(2) + " miles" : "N/A";

      $("#places_list").append(
        `<li><a href="#" class="to_details" data-index="${index}">${name}<span class="ui-li-count">${distance}</span></a></li>`
      );
    });

    // Refresh the list view
    $("#places_list").listview("refresh");
  }).fail(function (xhr) {
    alert("API error: " + xhr.status + " " + xhr.statusText);
  });
}

// Get the user's location (GPS)
function getLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported in this browser");
  }
}

// Success: User's location found
function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  PopulateList(lat, lon);
}

// Error: Couldn't get the user's location
function showError(error) {
  alert("Location error: " + error.message);
}

// Show details for the selected event
$(document).on("pagebeforeshow", "#details", function () {
  if (!currentEvent) return;

  const event = currentEvent;

  $("#placeName").text(event.name);
  $("#placeDate").text("Date: " + event.dates.start.localDate);
  $("#placeTime").text("Time: " + event.dates.start.localTime);

  // Check if venue information exists
  const venue = event._embedded && event._embedded.venues && event._embedded.venues[0];
  if (venue) {
    $("#placeVenue").text("Venue: " + venue.name);
  } else {
    $("#placeVenue").text("Venue: Not Available");
  }

  // Check if ticket URL exists
  if (event.url) {
    $("#placeLink").html('<a href="' + event.url + '" target="_blank">Buy Tickets</a>');
  } else {
    $("#placeLink").text("Ticket link not available");
  }
})
