<html><body><pre>
<?php
    /**
        ch03_php_delicious_example.php
    */
    
    define('DEL_USER',   'yourusername');
    define('DEL_PASSWD', 'yourpassword');

    // http://www.ejeliot.com/pages/5
    require_once 'includes/php-delicious.inc.php';

    $api = new PhpDelicious(DEL_USER, DEL_PASSWD);

    echo "Posting bookmark.\n";
    $api->AddPost(
        'http://decafbad.com',
        '0xDECAFBAD',
        "Friends don't let friends drink decaf.",
        array('programming', 'coffee', 'caffeine')
    );

    echo "Deleting bookmark.\n";
    $api->DeletePost('http://decafbad.com');

    echo "Recent posts:\n";
    foreach ($api->GetRecentPosts() as $post) {
        echo "\t".$post['desc']."\n";
    }

    echo "Top 10 tags:\n";

    function tag_order($a, $b) {
        $a_cnt = $a['count'];
        $b_cnt = $b['count'];
        if ($b_cnt == $a_cnt) { return 0; }
        return ($b_cnt < $a_cnt) ? -1 : 1;
    }

    $tags = $api->GetAllTags();
    usort($tags, "tag_order");

    foreach (array_slice($tags, 0, 10) as $tag) {
        echo "\t".$tag['tag']." - ".$tag['count']."\n";
    }

?>
</pre></body></html>
