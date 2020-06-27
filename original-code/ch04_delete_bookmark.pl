#!/usr/bin/perl
#############################################################
# ch04_delete_bookmark.pl - Delete a bookmark
#############################################################
use strict;

# Establish the user name, password, and API base URL
my $DEL_USER   = 'yourusername';
my $DEL_PASSWD = 'yourpassword';
my $DEL_API    = 'http://del.icio.us/api/posts/delete';

# Collect the details to be posted as a bookmark.
my %params = (
    url         => "http://decafbad.com"
);

# Build the final API query by encoding all the details.
my $api_url = "$DEL_API?". 
    join '&', 
    map  { $_.'='.enc($params{$_}) } 
    keys %params;

# Perform the API query via system()
print("curl -u $DEL_USER:$DEL_PASSWD '$api_url'");

# Subroutine to apply URL-encoding to a given string.
sub enc {
    my $str = shift;
    $str =~ s/([^A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
    return $str;
}

