#!/usr/bin/env python
"""
ch04_pydelicious_example.py - An example using pydelicious
"""
DEL_USER   = 'yourusername'
DEL_PASSWD = 'yourpassword'

import pydelicious

api = pydelicious.apiNew(DEL_USER, DEL_PASSWD)

print "Posting bookmark."
api.posts_add(
    url         = 'http://decafbad.com',
    description = '0xDECAFBAD',
    extended    = "Friends don't let friends drink decaf.",
    tags        = 'programming coffee caffeine'
)

print "Deleting bookmark."
api.posts_delete('http://decafbad.com')

print "Recent posts:"
for post in api.posts_recent():
    print "\t%(description)s" % post

print "Top 10 tags:"

def tag_order(a, b):
    return cmp( int(b['count']), int(a['count']) )

tags = api.tags_get()
tags.sort(tag_order)

for tag in tags[:10]:
    print "\t%(tag)s - %(count)s" % tag
