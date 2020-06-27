#!/usr/bin/perl
#############################################################
# ch03_add_bookmark.pl - Add a bookmark to your account
#############################################################
use strict;

# Establish the user name, password, and API base URL
my $DEL_USER   = 'yourusername';
my $DEL_PASSWD = 'yourpassword';
my $DEL_API    = 'http://del.icio.us/api/posts/add';

# Collect the details to be posted as a bookmark.
my %params = (
    url         => "http://decafbad.com",
    description => "0xDECAFBAD",
    extended    => "Friends don't let friends drink decaf.",
    tags        => "coffee blogs programming",
    replace     => "yes"
);

# Build the final API query by encoding all the details.
my $api_url = "$DEL_API?". 
    join '&', 
    map  { $_.'='.enc($params{$_}) } 
    keys %params;

# Perform the API query via system()
system("curl -u $DEL_USER:$DEL_PASSWD '$api_url'");

# Subroutine to apply URL-encoding to a given string.
sub enc {
    my $str = shift;
    $str =~ s/([^A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
    return $str;
}

