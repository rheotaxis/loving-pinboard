//
function init() {
  var lbox = document.getElementById('thumbs');
  //
  for (var i=0, post; post=Insipid.posts[i]; i++) {
    //
    var li = document.createElement('li');

//
    var a = document.createElement('a');
    var img = document.createElement('img');
    a.setAttribute('href', post.u);
    a.setAttribute('title', post.n);
//
    img.setAttribute('class', 'thumb');
    img.setAttribute('src', post.u);
    img.setAttribute('title', post.d);
    img.setAttribute('alt', post.n);
//
    var cptn = document.createElement('span');
    cptn.setAttribute('class', 'caption');
    cptn.setAttribute('id', 'caption_'+i);
    var text = document.createTextNode(post.n);
    cptn.appendChild(text);
//
    a.appendChild(img);
//
    li.appendChild(a);
    li.appendChild(cptn);
//
    lbox.appendChild(li);
  }
}
//
window.onload = init;
//