/**
    ch06_gmaps_geotags.js
    
    Build map markers from geotagged bookmarks.
*/

// http://geocoder.us/
var HOME = {
    title: "Home Sweet Home!",
    url:   "http://decafbad.com",
    lat:   42.528458,
    long:  -83.152184,
    zoom:  6
};

var BASE_ICON, ICON_CNT;

/**
    Initialize the map, icon assets, and add the markers.
*/
function init() {
    var map   = initMap();
    BASE_ICON = initBaseIcon();
    ICON_CNT  = 0;
    addMarker(map, HOME);
    addPostPoints(map, Delicious.posts);
}
window.onload = init;

/**
    Initialize the Google Map instance, add appropriate 
    controls.
*/
function initMap() {
    var map   = new GMap(document.getElementById("map"));
    var point = new GPoint(HOME.long, HOME.lat);
    map.addControl(new GSmallZoomControl());
    map.addControl(new GMapTypeControl());
    map.centerAndZoom(point, HOME.zoom);
    return map;
}

/**
    Prepare a base icon on which all other markers' icons
    will be based.
*/
function initBaseIcon() {
    icon = new GIcon();
    icon.shadow = "http://www.google.com/mapfiles/shadow50.png";
    icon.iconSize         = new GSize(20, 34);
    icon.shadowSize       = new GSize(37, 34);
    icon.iconAnchor       = new GPoint(9, 34);
    icon.infoWindowAnchor = new GPoint(9, 2);
    icon.infoShadowAnchor = new GPoint(18, 25);
    return icon;
}

/**
    Walk through del.icio.us bookmark posts made available 
    via JSON.  Find geotagged bookmarks and attempt to
    extract the details to build a map marker from the tags.
*/
function addPostPoints(map, posts) {

    // Iterate through all the available bookmark posts.
    for (var i=0, post; post=posts[i]; i++) {

        // Prepare an empty data record.
        var data = {};

        // Extract the bookmark title and URL.
        data.title = post.d;
        data.url   = post.u;

        // Start off with the assumption that this is not
        // a geotagged bookmark.
        var is_geotagged = false;

        // Iterate through all the tags attached to this post.
        for (var j=0, tag; tag=post.t[j]; j++) {

            // If this bookmark is geotagged, flip the flag.
            if (tag == 'geotagged') is_geotagged = true;

            // Look for property value delimiter, otherwise
            // skip property tag handling.
            var eq_pos = tag.indexOf('=');
            if (eq_pos == -1) continue;

            // Look for geo:lat=XXX property
            if (tag.indexOf('geo:lat') == 0) 
                data.lat = tag.substring(eq_pos+1);
            
            // Look for geo:long=XXX property
            if (tag.indexOf('geo:long') == 0) 
                data.long = tag.substring(eq_pos+1);
        }

        // If this bookmark was geotagged, add a new marker.
        if (is_geotagged) addMarker(map, data);
    }
}

/**
    Given a map and a data record, construct a new marker
    for placement on the map.  In addition, add it to the
    map's legend.
*/
function addMarker(map, data) {

    // Create a new icon using the next lettered image.
    var idx    = (ICON_CNT++);
    var letter = String.fromCharCode("A".charCodeAt(0) + idx);
    var icon   = new GIcon(BASE_ICON);
    icon.image = "http://www.google.com/mapfiles/marker" + 
        letter + ".png";
    
    // Add this icon and bookmark to the legend.
    addToLegend(data, icon);

    // Construct the location point and marker object.
    var point  = new GPoint(data.long, data.lat);
    var marker = new GMarker(point, icon);
    
    // If there is a title for this marker, hook up an
    // on-click info bubble for it.
    if (data.title) {
        var ele = createBubbleContents(data);
        GEvent.addListener(marker, 'click', function () {
            marker.openInfoWindow(ele);
        });
    }
    
    // Add the marker to the map and return.
    map.addOverlay(marker);
    return marker;
}

/**
    Construct and insert the elements necessary to add a marker
    to the map legend.
*/
function addToLegend(data, icon) {
    var img = document.createElement('img');
    img.setAttribute('src', icon.image);

    var text = document.createTextNode(' '+data.title);

    var link = document.createElement('a');
    link.setAttribute('href', data.url);
    link.appendChild(text);

    var item = document.createElement('li');
    item.appendChild(img);
    item.appendChild(link);

    var legend = document.getElementById('legend');
    legend.appendChild(item);
}

/**
    Construct and return the DOM elements necessary to 
    populate a marker's pop-up info bubble.
*/
function createBubbleContents(data) {
    var div = document.createElement('div');
    div.setAttribute('class', 'note');

    var link = document.createElement('a');
    link.setAttribute('href', data.url);
    
    var text = document.createTextNode(data.title);
    link.appendChild(text);

    div.appendChild(link);
    return div;
}
