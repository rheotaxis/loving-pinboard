/**
    ch09_bookmark_this.js
    
    Inject del.icio.us bookmark links into an OPML blog page.
    l.m.orchard@pobox.com http://decafbad.com/
*/

var DEL_LINK_TITLE  = "Bookmark this at del.icio.us!";
var DEL_ICON_WIDTH  = 10;
var DEL_ICON_HEIGHT = 10;
var DEL_ICON_SRC    =
    'http://hosting.opml.org/decafbad/blog/decorations/delicious.png';

function bookmarkThisInit() {

    // Iterate through all the images found on the page.
    var imgs = document.getElementsByTagName('img');
    for (var i=0, img; img=imgs[i]; i++) {
        
        // Does the alt text contain "Permanent link"?
        if ( /Permanent link/.test(img.alt) ) {

            // Grab the actual permalink, along with its URL.
            var perma     = img.parentNode;
            var perma_url = perma.href;
            
            // Find a title for this permalink, based on the
            // post title or anchor name.
            var bs = perma.parentNode.getElementsByTagName("b");
            var title = (bs.length) ?
                bs[0].firstChild.nodeValue :
                perma.parentNode.firstChild.name;

            // Include the document title, for good measure.
            title += " - " + document.title;

            // Construct a del.icio.us posting form URL.
            var del_url = "http://del.icio.us/post";
            del_url += "?url=" + encodeURIComponent(perma_url);
            del_url += "&title=" + encodeURIComponent(title);

            // Build the link element for injection.
            var del_link = document.createElement("a");
            del_link.setAttribute("href",  del_url);
            del_link.setAttribute("title", DEL_LINK_TITLE);
            del_link.style.marginLeft  = DEL_ICON_WIDTH+"px";
            del_link.style.marginRight = DEL_ICON_WIDTH+"px";

            // Build the link icon.
            var del_img = document.createElement("img");
            del_img.setAttribute("width",  DEL_ICON_WIDTH);
            del_img.setAttribute("height", DEL_ICON_HEIGHT);
            del_img.setAttribute("src",    DEL_ICON_SRC);
            del_img.style.border = "none";

            // Add the link icon into the link, then add the link.
            del_link.appendChild(del_img);
            perma.parentNode.appendChild(del_link);

        }
    }
}

// See: http://simon.incutio.com/archive/2004/05/26/addLoadEvent
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}

addLoadEvent(bookmarkThisInit);

