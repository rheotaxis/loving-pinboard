/**
    ch09_delicious_related.js
    
    Facilitates the injection of related links by tag from
    del.icio.us JSON feeds.
*/
DeliciousRelated = {
    
    JSON_BASE_URL: 'http://del.icio.us/feeds/json/deusx',
    MAX_LINKS:     5,
    
    // Array of jobs scheduled to run at page load
    _jobs: {},
    
    /**
        On window load, fire off all the scheduled jobs.
    */
    init: function() {
        for(jid in this._jobs) 
            this._jobs[jid].load();
    },
    
    /**
        Given a job / element ID and a del.icio.us tag,
        schedule a job to load up links for the tag.
    */
    register: function(jid, tag) {
        var _dr = this; 
        this._jobs[jid] = {
            jid: jid,
            tag: tag,
            
            load: function() 
                { _dr.loadTag(this) },
            loaded: function(posts) 
                { _dr.tagLoaded(this, posts) }
        }
    },

    /**
        Initiate the loading of JSON link data for a 
        scheduled job.
    */
    loadTag: function(job) {
        var cb_ref = "DeliciousRelated._jobs['"+job.jid+"'].loaded";
        
        var json_url = this.JSON_BASE_URL;
        json_url    += '/'+job.tag;
        json_url    += '?callback='+encodeURIComponent(cb_ref);

        var script_ele  = 
            createDOM('script', 
                { 'type': 'text/javascript', 'src':json_url });

        document.getElementsByTagName("head")[0].appendChild(script_ele);
    },

    /**
        Handle the completion of loading JSON link data,
        inject list links for each post found.
    */
    tagLoaded: function(job, posts) {
        var list = $(job.jid);
        for (var i=0, post; i<this.MAX_LINKS && (post=posts[i]); i++) {
            list.appendChild(
                LI({}, A({'href':post.u}, post.d))
            );
        }
    }

};

// Schedule the package init to fire at window load.
addLoadEvent(function() { DeliciousRelated.init() });
