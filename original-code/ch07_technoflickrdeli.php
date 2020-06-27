<?php
    /**
        ch07_technoflickrdeli.php

        Build a tag-based mashup of Technorati, Flickr, 
        and del.icio.us
    */

    // Add the local PHP includes dir to path.
    ini_set("include_path", 
        ini_get("include_path").":includes");

    // See: http://www.phpflickr.com
    require_once "phpFlickr.php";

    // See: http://www.kailashnadh.name/ducksoup/
    require_once "duckSoup.php";
    
    // See: http://www.ejeliot.com/pages/5
    require_once 'php-delicious.inc.php';
    
    // See: http://magpierss.sourceforge.net/
    require_once "magpierss/rss_fetch.inc";

    // del.icio.us API configuration
    define("DEL_USER",     "YOURUSERNAME");
    define("DEL_PASSWD",   "YOURPASSWORD");
    define("DEL_TAG_MAX",  20);
    define("DEL_TAG_FEED", "http://del.icio.us/rss/tag/");

    // API keys for Technorati
    define("TECHNORATI_API_KEY", 
        "46333ab61e7345c2573024a47e67e8aa"); 

    // API key for Flickr
    define("FLICKR_API_KEY",     
        "0ed040a7c16b0b24b5ae2288c4c4306c");
    
    // Settings for data caching.
    define("CACHE_DIR",        "./data/tfd-cache");
    define("CACHE_AGE",        5 * 60 * 60);
    define("MAGPIE_CACHE_DIR", CACHE_DIR);
    define("MAGPIE_CACHE_AGE", CACHE_AGE);
    
    // Figure out what tag to display from params
    $the_tag = isset($_GET['tag']) ? $_GET['tag'] : 'funny';

    /**
        Fetch photo data from Flickr for a given tag.
    */
    function fetchFlickrTag($tag) {
        $fapi = new phpFlickr(FLICKR_API_KEY);
        $fapi->enableCache("fs", CACHE_DIR);
        $results = $fapi->photos_search(
            array("tags"=>$tag)
        );
        
        $photos = array();
        foreach ($results['photo'] as $result) {
            $photo = $result;
            $photo['sizes'] = 
                $fapi->photos_getSizes($result['id']);
            array_push($photos, $photo);
        }
        return $photos;
    }

    /**
        Fetch blog entry data from Technorati for 
        a given tag.
    */
    function fetchTechnoratiTag($tag) {
        $tapi          = new duckSoup;
        $tapi->api_key = TECHNORATI_API_KEY;     
        $tapi->type    = 'taginfo';    
        $tapi->params  = array('tag' => $tag);
        $results = $tapi->get_content();
        return $results['item'];   
    }

    /**
        Fetch bookmark feed data from del.icio.us 
        for a given tag.
    */
    function fetchDeliciousTag($tag) {
        $url = DEL_TAG_FEED . $tag;
        $data = fetch_rss($url);
        return $data->items;
    }

    /**
        Fetch all del.icio.us tags, with caching.
    */
    function fetchAllDeliciousTags() {
        $dapi = new PhpDelicious(DEL_USER, DEL_PASSWD);
        $tags = $dapi->GetAllTags();
        usort($tags, "cmpTags");
        return array_slice($tags, 0, DEL_TAG_MAX);
    }

    /**
        Compare tags for sorting in order of most used.
    */
    function cmpTags($a, $b) {
        $a_cnt = $a['count'];
        $b_cnt = $b['count'];
        if ($b_cnt == $a_cnt) { return 0; }
        return ($b_cnt < $a_cnt) ? -1 : 1;
    }

?>
<html>
    <head>
        <title>TechnoFlickrDeli</title>
        
        <meta http-equiv="content-type" 
              content="text/html;charset=utf8" />

        <link href="ch07_technoflickrdeli.css" 
              type="text/css" rel="stylesheet" />
    </head>
    <body>
        <h1>TechnoFlickrDeli: <?php echo $the_tag ?></h1>

        <div id="tags">
            <ul>
            <?php 
            foreach (fetchAllDeliciousTags() as $tag) { 
                if ($tag['tag'] == 'system:unfiled') continue;
                ?>
                <li>
                    <a href="?tag=<?php echo $tag['tag'] ?>">
                        <?php echo $tag['tag'] ?> 
                    </a>
                    <span>(<?php echo $tag['count'] ?>)</span>
                </li>
                <?php 
            } 
            ?>
            </ul>
        </div>

        <div id="blogs">
            <h2>Blogs</h2>
            <ul>
            <?php 
            foreach (fetchTechnoratiTag($the_tag) as $blog) { 
                $blog_url  = $blog['weblog']['url'];
                $blog_name = $blog['weblog']['name'];
                $permalink = $blog['permalink'];
                $title     = $blog['title'];
                $excerpt   = $blog['excerpt'];
                ?>
                <li>
                    <a href="<?php echo $blog_url ?>">
                        <?php echo $blog_name ?>
                    </a> 
                    ::  
                    <a href="<?php echo $permalink ?>">
                        <?php echo $title ?>
                    </a> 
                    <blockquote>
                        <?php echo $excerpt ?>
                    </blockquote>
                </li>
                <?php 
            } 
            ?>
            </ul>
        </div>

        <div id="photos">
            <h2>Photos</h2>
            <ul>
            <?php 
            foreach (fetchFlickrTag($the_tag) as $photo) {
                $title = $photo['title'];
                $link  = $photo['sizes']['Square']['url'];
                $img   = $photo['sizes']['Square']['source'];
                ?>
                <li>
                    <a href="<?php echo $link ?>" 
                       title="<?php echo $title ?>">
                       <img src="<?php echo $img ?>" />
                    </a>
                </li>
                <?php 
            }
            ?>
            </ul>
        </div>
        
        <div id="bookmarks">
            <h2>Bookmarks</h2>
            <ul>
            <?php 
            foreach (fetchDeliciousTag($the_tag) as $bookmark) { 
                $link  = $bookmark['link'];
                $title = $bookmark['title'];
                $desc  = $bookmark['description'];
                ?>
                <li>
                    <a href="<?php echo $link ?>">
                        <?php echo $title ?>
                    </a> 
                    <blockquote>
                        <?php echo $desc ?>
                    </blockquote>
                </li>
                <?php 
            } 
            ?>
            </ul>
        </div>

    </body>
</html>
