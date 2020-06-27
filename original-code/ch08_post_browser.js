/**
	ch08_post_browser.js

	Implementation of an AJAX-powered date and tag browser for
	del.icio.us posts, with optional support for a PHP proxy or
	static captures of API data.
*/

var USE_PROXY = false;
var STATIC_URI = "del-posts";

/**
	Initialize the browser, load up the list of dates.

*/

function init() {
	// Insert loading messages into the selectors.
	setOptions('date_selector', [['Loading dates...', '']]);
	setOptions('tag_selector', [['Loading tags...', '']]);

	// Switch between proxy and static API URLs for dates.
	var dates_url = (USE_PROXY) ? PROXY_URI+'/posts/dates' : STATIC_URI+'/dates.xml';
	// Fire up the request for dates...
	var d = doSimpleXMLHttpRequest(dates_url);
	d.addCallback(datesFetched);
	d.addErrback(function(){setOptions('date_selector', [['Dates not loaded.', '']]);});

	// Switch between proxy and static API URLs for tags
	var tags_url = (USE_PROXY) ? PROXY_URI+'/tags/get' : STATIC_URI+'/tags.xml';
	// Fire up the request for tags...
	var d = doSimpleXMLHttpRequest(tags_url);
	d.addCallback(tagsFetched);
	d.addErrback(function(){setOptions('tag_selector', [['Tags not loaded.', '']]);});

}
addLoadEvent(init);

/**
	Process the list of dates when it arrives, populate the
	drop-down menu and wire it up to react to selections.
*/
function datesFetched(req) {
	var xml = req.responseXML;
	var dates = xml.getElementsByTagName('date');
	var date_cnt = 0;

  // Add the dates fetched as select options.
	setOptions('date_selector',
	  map(function(date) {
		var date_txt = date.getAttribute('date');
		var count_txt = date.getAttribute('count');
		return [date_txt+' ('+count_txt+')', date_txt];
	  }, dates)
	);

  // Register the selector change handler.
	$('date_selector').onchange = dateSelected;

	// Start things off by loading up the first set of links.
	return $('date_selector').onchange();
  // NOTE: fails here if XML file not present for date selected
  // caused when post date downloaded from del.icio.us is included, but
  // the XML for bookmarks on same date has not been downloaded yet.

}

/**
	Process the list of tags when it arrives, populate the
	drop-down menu and wire it up to react to selections.
*/
function tagsFetched(req) {
	var xml = req.responseXML;
	var tags = xml.getElementsByTagName('tag');
	var tag_cnt = 0;

	// Add the tags fetched as select options.
	setOptions('tag_selector',
	  map(function(tag) {
		var tag_txt = tag.getAttribute('tag');
		var count_txt = tag.getAttribute('count');
		return [tag_txt+' ('+count_txt+')', tag_txt];
	  }, tags)
	);

	// Register the selector change handler.
	$('tag_selector').onchange = tagSelected;
}

/**
	React to a new selection by loading up posts for the date.
*/
function dateSelected() {
	// Get the selected date from the drop down.
	var date = this.options[this.selectedIndex].value;
	var url;
	if (USE_PROXY) {
	  // Use a proxy-based URL.
	  url = PROXY_URI+'/posts/get&dt='+date
	} else {
	  // Use a static file path URL.
	  var path = date.split('-').join('/');
	  url = STATIC_URI + '/' + path + '.xml';
	}
  //alert(url);
	loadPosts(url);
}

/**
	React to a new selection by loading up posts for the tag.
*/
function tagSelected() {
	// Get the selected tag from the drop down.
	var tag = this.options[this.selectedIndex].value;
	var url;
	if (USE_PROXY) {
	  // Use a proxy-based URL.
	  url = PROXY_URI+'/posts/all&tag='+tag
	} else {
	  // Use a static file path URL.
	  var path = tag.split('-').join('/');
	  url = STATIC_URI + '/' + path + '.xml';
	}
  //alert(url);
	loadPosts(url);
}

/**
	Given a URL, initiate the process of loading a new set of 
	bookmark posts into the browser.
*/
function loadPosts(url) {
	// Initiate a GET request for the posts.
	setContent($('links'), 'Loading posts...');
	var d = doSimpleXMLHttpRequest(url);
	d.addCallback(postsFetched);
	d.addErrback(function(rv) {
	  setContent($('links'), 'Problem loading '+url+'!');
	});
}

/**
	Process the arriving posts data, rebuild the list of links
	shown on the page.
*/
function postsFetched(req) {
	// Get the incoming XML, extract user name and list of posts.
	var xml = req.responseXML;
	var user = getNodeAttribute(xml.firstChild, 'user');
	var posts = xml.getElementsByTagName('post');

	// Build the HTML list of posts using build postItem
	var posts_list =
	  UL({'class':'delPosts'},
	    map(function(post){
	      return buildPostItem(user, post);
	    }, posts)
	  );

	// Replace the existing list of links on page.
	setContent($('links'), posts_list);
}

/**
	Given a user name and a post node, build the HTML
	for a single boomark post.
*/
function buildPostItem(user, post) {

	// Extract the attributes form the post.
	var data = extractFromPost(post);

	// Build the link post list item.
	var item =
	  LI({'class':'delPost'},
	    SPAN({'class':'delTime'}, data['time']),
	    A({'class':'delLink', href:data['href']},data['description']),
      SPAN({'class':'delExtended'}, data['extended'])
    );

	// Add tag links, if any tags attached.
  var tags = data['tag'].split(' ');
  if (tags) {
    var tags_list = buildTagList(user, tags);
    appendChildNodes(item, tags_list);
  }
  
	//
	return item;
}

/**
  Given an XML node representing a bookmark post, extract all
  the attributes containing the bookmark's details.
*/
function extractFromPost(post) {
  var data = {};
  forEach(
    ['time','href','description','extended','tag'],
    function(k) { data[k] = getNodeAttribute(post, k) }
  );
  return data;
}

/**
  Given a user name and a list of tags, build an HTML list of 
  taglinks.
*/
function buildTagList(user, tags) {
  return UL({'class':'delTags'},
    map(function(tag) {
      var href = 'http://del.icio.us/'+user+'/'+tag;
      return LI({'class':'delTag'}, A({href:href}, tag));
    }, tags)
  );
}

/**
  Set the options for a given select identified by ID.
*/
function setOptions(sid, data) {
  var opts = $(sid).options;
  opts.length = 0;
  forEach(data, function(d) {
    opts[opts.length] = new Option(d[0], d[1]);
  });
}
  
/**
  Completely replace the content of a given parent with the
  children supplied.
*/
function setContent(node, children) {
  while (node.firstChild)
    node.removeChild(node.firstChild);
  appendChildNodes(node, children);
}
