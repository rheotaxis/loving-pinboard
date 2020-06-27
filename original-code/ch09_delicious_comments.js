/**
    ch09_delicious_comments.js
    
    Insert del.icio.us bookmark counts and links for blog
    post permalinks and individual archives.
*/
DeliciousComments = {

    // See: http://decafbad.com/trac/wiki/FeedMagick
    RSS_TO_JSON_URL: 
        'http://yoursite.com/FeedMagick/www-bin/as-json.php',

    DEL_URL_BASE:    'http://del.icio.us/',
    DEL_ICON_SRC:    'http://decafbad.com/2006/03/delicious.png',
    DEL_ICON_WIDTH:  10,
    DEL_ICON_HEIGHT: 10,
    
    // Initially empty map of ids to post load schedule
    _schedule: {},

    /**
        On window load, fire off all the scheduled load events.
    */
    init: function() {
        for(node_id in this._schedule) 
            this._schedule[node_id].load();
    },

    /**
        Given a destination container node ID, blog post 
        permalink, and preference for mini or full display, 
        register a comment display for loading.
    */
    register: function(node_id, permalink, full_display) {
        var _dc = this;
        this._schedule[node_id] = {
            node_id:      node_id, 
            permalink:    permalink,
            full_display: full_display,

            load:   function()     { _dc.loadFeed(this); },
            loaded: function(feed) { _dc.feedLoaded(this, feed); }
        };
    },

    /**
        For a given scheduled post, initiate loading of the per-URL
        del.icio.us feed.
    */
    loadFeed: function(post) {

        var cb_ref = 
            "DeliciousComments._schedule['"+post.node_id+"'].loaded";
        
        // See: http://pajhome.org.uk/crypt/md5/md5src.html
        var feed_url = this.DEL_URL_BASE+'rss/url/';
        feed_url += hex_md5(post.permalink);

        var script_url  = this.RSS_TO_JSON_URL; 
        script_url     += "?in=" + encodeURIComponent(feed_url);
        script_url     += "&callback=" + encodeURIComponent(cb_ref);

        var script_ele  = 
            createDOM('script', 
                { 'type': 'text/javascript', 'src':script_url });

        document.getElementsByTagName("head")[0].appendChild(script_ele);
    },

    /**
        Once a feed has loaded, process the feed for the post.
    */
    feedLoaded: function(post, feed) {

        // Switch between full or mini display, based on 
        // preference at time of scheduling.
        var display_node = (post.full_display) ? 
            this.renderFullDisplay(post, feed) : 
            this.renderMiniDisplay(post, feed);

        // Insert the display into the parent node.
        appendChildNodes(post.node_id, display_node);

    },

    /**
        Build a simple bookmark count with icon image and a link
        to all bookmarks for the post.
    */
    renderMiniDisplay: function(post, feed) {
        var _dc = this;

        // Compose the URL to bookmarks list for the permalink 
        // given for this post.
        var link_url = this.DEL_URL_BASE + "url";
        link_url    += "?url="+encodeURIComponent(post.permalink);

        return SPAN({ 'class':'delCommentCount' },
            A({ 'href': link_url }, 
                IMG({
                    'src':    this.DEL_ICON_SRC,
                    'width':  this.DEL_ICON_WIDTH,
                    'height': this.DEL_ICON_HEIGHT
                }),
                ' (' + feed.items.length + ')'
             ),
             ' | '
        );
    },

    /**
        Build a full list of bookmarks for a given permalinked
        blog post and loaded feed.
    */
    renderFullDisplay: function(post, feed) {
        var _dc = this;

        // Compose the URL to bookmarks list for the permalink 
        // given for this post.
        var link_url = this.DEL_URL_BASE + "url";
        link_url    += "?url="+encodeURIComponent(post.permalink);
        
        return [
            H3({}, 
                IMG({ 'src': this.DEL_ICON_SRC }),
                ' ',
                A({'href': link_url}, 
                    feed.items.length,
                    ' del.icio.us bookmarks for this post'
                ) 
            ),
            UL({ 'class': 'delComments' },
                map(function(item) { 
                    return _dc.renderOneBookmark(item) 
                }, feed.items)
            )
        ];
    },

    /**
        Given a bookmark feed item, return rendered HTML.
    */
    renderOneBookmark: function(item) {
        var name = item.dc.creator;
        var tags = item.dc.subject;
        var date = item.dc.date;
        var url  = this.DEL_URL_BASE + name;

        var link = A({ 'href': url }, name, ' @ ', date);

        var description = (!item.description) ? '' :
            '"'+item.description+'" ';

        var tag_links = (!tags) ? '' :
            map(function(tag) {
                return [ A({'href':url+'/'+tag}, tag), ' '];
            }, tags.split(' '));

        return LI({ 'class': 'delComment' },
            link, ': ', description, tag_links
        );
    }

}

// Schedule DeliciousComments initialization on window load.
addLoadEvent(function() { DeliciousComments.init() });
