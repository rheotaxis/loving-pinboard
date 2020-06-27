/**

*/
var ticker;
function init() {
    ticker = new DeliciousTicker('tickerContent', Delicious.posts);
    ticker.start();
}
window.onload = init;

function DeliciousTicker(eid, posts) 
    { return this.init(eid, posts); }

DeliciousTicker.prototype = {
    
    init: function(eid, posts) {
        this.eid      = eid;
        this.anim     = new ScrollAnim(eid);
        this.height   = 
            ($(eid).parentNode.offsetHeight + $(eid).offsetHeight) / 2;

        this.wait     = 5000;
        this.idx      = 0;
        this.posts    = posts;
        this._running = false;
    },

    start: function() {
        if (this._running) return;
        this._running = true;
        this.run();
    },

    stop: function() {
        this._running = false;
    },

    run: function() {
        if (!this._running) return;
        var _this = this;
        setTimeout(function() { _this.hidePost(); }, this.wait);
    },

    hidePost: function() {
        if (!this._running) return;
        var _this = this;
        this.anim.start(0, this.height, function() { 
            $(this.eid).style.display = 'none';
            _this.replacePost();
        });
    },

    replacePost: function() {
        if (this.idx >= this.posts.length) this.idx = 0;

        var post = this.posts[this.idx++];
        $(this.eid).innerHTML = 
            '<a href="'+post.u+'">'+post.d+'</a>';

        this.revealPost();
    },

    revealPost: function() {
        if (!this._running) return;
        $(this.eid).style.display = 'block';
        var _this = this;
        this.anim.start(0-this.height, 0, function() { 
            _this.run() 
        });
    }

};

function ScrollAnim(eid) { return this.init(eid); }
ScrollAnim.prototype = {
    
    init: function(eid) {
        this.eid      = eid;
        this._running = false;
        this.interval = 15;
        this.duration = 500;
    },

    start: function(from_pos, to_pos, done_cb, ease_cb) {
        if (this._running) return;
        this._running   = true;

        if (!ease_cb) ease_cb = Math.easeInSine;
        this.ease = ease_cb;

        this.done_cb    = done_cb;
        this.from_pos   = from_pos;
        this.curr_pos   = this.from_pos;
        this.to_pos     = to_pos;
        this.start_time = new Date().getTime();
        this.distance   = this.to_pos - this.from_pos;

        var _this = this;
        setTimeout(function() { _this.run(); }, this.interval);
    },

    stop: function() {
        this._running = false;
        if (this.done_cb) this.done_cb();
    },

    run: function() {
        if (!this._running) return;

        if (Math.abs(this.to_pos - this.curr_pos) <= 1)
            return this.stop();

        var curr_time     = new Date().getTime();
        var curr_duration = curr_time - this.start_time;
        if (curr_duration > this.duration) 
            return this.stop();
        
        var ele = $(this.eid);

        this.curr_pos = this.ease(curr_duration, this.from_pos, 
            this.distance, this.duration);
        ele.style.top = this.curr_pos+'px';

        var _this = this;
        setTimeout(function() { _this.run(); }, this.interval);
    }

};

// http://www.actionscript.org/forums/showthread.php3?s=&threadid=5312
// sinusoidal easing in - accelerating from zero velocity
// t: current time, b: beginning value, c: change in position, d: duration
Math.easeInSine = function (t, b, c, d) {
	return -c * Math.cos(t/d * Math.PI/2) + c + b;
}

function $(id) { return document.getElementById(id); }

