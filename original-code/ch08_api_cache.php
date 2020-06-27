<?php
  /**
    ch08_api_cache.php
    
    Provide a caching proxy in front of the del.icio.us API
    for use by the AJAX browser.
  */
  
  define('DEL_API',       'api.del.icio.us/v1');
  define('DEL_USER',      'XXX');
  define('DEL_PASSWD',    'YYY');
  define('DEL_POSTS_PATH','del-posts');
  define('DEL_CACHE_AGE', '3600');
  
  // http://sourceforge.net/projects/snoppy/
  ini_set("include_path", ini_get("include_path").":includes");
  require_once 'includes/Snoopy.class.php';
  
  if (isset($_SERVER['QUERY_STRING'])) {
  
    $query = $_SERVER['QUERY_STRING'];
    $qrylen = strlen($query);
    if (strpos($query,"&") > 0) {
      $split = strpos($query,"&");
      $path = substr($query, 0, $split);
      $subset = substr($query, $split+1, $qrylen-$split);
    } else {
      $path = $query;
    }
    switch($path) {
      
      // Proxy through requests for dates
      case '/posts/dates':
        echo delAPI($path, DEL_POSTS_PATH.'/dates.xml');
        exit;
      
      // Proxy through requests for tags
      case '/tags/get':
        echo delAPI($path, DEL_POSTS_PATH.'/tags.xml');
        exit;
      
      // Proxy through requests for post gets
      case '/posts/get':
      
        // Pass the query string on through to API
        // $path .= '?'.$_SERVER['QUERY_STRING'];
        $path .= '?'.$subset;
        
        //Cache filename starts at root
        $get_fn = DEL_POSTS_PATH;
        
        // Build the date into the cache path.
        if (isset($_GET['dt'])) {
          $pat = '/(\d{4})-(\d{2})-(\d{2})/';
          if (preg_match($pat, $_GET['dt'], $parts)) {
            $parts = array_slice($parts, 1);
            $get_fn .= '/'.join('/', $parts);
          }
        }
        
        // Build tag filters into the cache path.
        if(isset($_GET['tag'])) {
          $bad = array(' ', '/');
          $tag = str_replace($bad, '-', $_GET['tag']);
          $get_fn .= '/'.$tag;
        }
        
        // If neither date nor tags found, assume index
        if ($get_fn == DEL_POSTS_PATH) {
          $get_fn .= '/index';
        }
        
        // Tack a .xml extension ont o the end of the path
        $get_fn .= '.xml';
        
        // Dispatch off to the API.
        echo delAPI($path, $get_fn);
        exit;
        
      // Proxy through requests for all posts
      case '/posts/all':
      
        // Pass the query string on through to API
        // $path .= '?'.$_SERVER['QUERY_STRING'];
        $path .= '?'.$subset;
        
        // Cache filename starts at root
        $get_fn = DEL_POSTS_PATH.'/all';
        
        // Build tag filters into the cache path.
        if (isset($_GET['tag'])) {
          $bad = array(' ','/');
          $tag = str_replace($bad, '-', $_GET['tag']);
          $get_fn .= 'tags/'.$tag;
        } else {
          // We're going to fetch everything ...
          $get_fn .= '/00index';
        }
        
        // Tack a .xml extension onto the end of the path
        $get_fn .= '.xml';
        
        // Dispatch off to the API.
        echo delAPI($path, $get_fn);
        exit;
    }
  }
  
  /**
    Perform a request on the del.icio.us API. with an attempt to use cached data first.
  */
  function delAPI($path, $fn) {
    
    // Assume all requirest with a path result in XML.
    header('Content-Type: text/xml');
    
    // Attempt to server up non-stale data from cadhe.
    $now = time();
    if (is_file($fn)) {
      $age = $now - filemtime($fn);
      if ($age < DEL_CACHE_AGE) {
        return file_get_contents($fn);
      }
    }
    
    // Create the cache path . if necessary.
    $dir = dirname($fn);
    if (!is_dir($dir)) {
      $curr = DEL_POSTS_PATH;
      $local = str_replace($curr.'/', '', $dir);
      $parts = explode('/', $local);
      while (count($parts) > 0) {
        $curr .= '/' . array_shift($parts);
        if (!is_dir($curr)) mkdir($curr);
      }
    }
    
    // Cache is stale, so fetch fresh from the API
    $base = 'https://'.DEL_USER.':'.DEL_PASSWD.'@'.DEL_API;
    $client = new Snoopy();
    $client->curl_path="c:/cygwin/bin/curl.exe";
    $client->fetch($base.$path);
    
    // Grab the data from the fetch, cache it, return it.
    $data = $client->results;
    file_put_contents($fn, $data);
    return $data;
  }
  
  function file_put_contents($n,$d) {
    $f=@fopen($n,"w");
    if (!$f) {
     return false;
    } else {
     fwrite($f,$d);
     fclose($f);
     return true;
    }
  }  
  
?>
<html>
  <head>
    <title>del.icio.us mini-browser</title>
    
    <!-- http://www.mochikit.com/ -->
    <script src="MochiKit/MochiKit.js" type="text/javascript"></script>
    
    <script src="ch08_post_browser.js" type="text/javascript"></script>
    
    <link href="ch08_post_styles.css" type="text/css" rel="stylesheet" />
    
    <script type="text/javascript">
      var USE_PROXY = true;
      var PROXY_URI = location.href + '?';
    </script>
    
  </head>
  <body>
    <form id="main">
      <select id="date_selector">
        <option value="">No dates loaded</option>
      </select>
      <select id="tag_selector">
        <option value="">No tags loaded</option>
      </select>
    </form>
    
    <div id="links">No links loaded.</div>
    
  </body>
</html>

