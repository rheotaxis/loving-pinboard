#!/usr/bin/perl
##############################################################
# ch03_net_delicious_example.pl
##############################################################
our $DEL_USER   = 'yourusername';
our $DEL_PASSWD = 'yourpassword';

use Net::Delicious;
use Log::Dispatch::Screen;

my $api = Net::Delicious->new({user=>$DEL_USER, 
                               pswd=>$DEL_PASSWD});

print "Posting bookmark.\n";
$api->add_post({
    url         => 'http://decafbad.com',
    description => '0xDECAFBAD',
    extended    => "Friends don't let friends drink decaf.",
    tags        => 'programming coffee caffeine'
});

print "Deleting bookmark.\n";
$api->delete_post({
    url         => 'http://decafbad.com'
});

print "Recent posts:\n";
for my $post ($api->recent_posts()) {
    print "\t".$post->description()."\n";
}

print "Top 10 tags:\n";
my @tags = sort { $b->count <=> $a->count } $api->tags();
for my $tag (@tags[1..10]) {
    print "\t".$tag->tag." - ".$tag->count."\n";
}


