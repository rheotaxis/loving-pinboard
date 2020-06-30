/**
    ch06_bookmark_lightbox.js
    Display bookmark images in a "lightbox" of thumbnails.
*/
Pinboard = {
  init: function init(data) {
    // Grab a reference to the container for image thumbnails
    var lbox = document.getElementById('thumbs');

    // Iterate through the list of bookmarks loaded via JSON.
    for (var i=0, post; post=data[i]; i++)
    {
        // create a new list element for the thumbnail
        var li = document.createElement('li');

        // build a link to wrap around the images
        var a = document.createElement('a');
        a.setAttribute('href', post.u);
        a.setAttribute('title', post.n);

        // build the actual image from bookmark data
        var img = document.createElement('img');
        img.setAttribute('class', 'thumb');
        img.setAttribute('src', post.u);
        img.setAttribute('title', post.d);
        img.setAttribute('alt', post.n);

        // nest the image in the link
        a.appendChild(img);

        // nest the link in the list item
        li.appendChild(a);

        // add the list item to the list of thumbs
        lbox.appendChild(li);
    }
  }
}
