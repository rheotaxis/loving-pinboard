#!/usr/bin/env python
"""
ch08_mirror_posts.py

Download bookmarks from del.icio.us and mirror
them locally as XML and HTML.
"""

# Import some core modules, add the 'lib' directory to
# module search path.
import sys, os, os.path, urllib2, time
from xml.sax import SAXParseException
sys.path.append('lib')

# http://www.aaronsw.com/2002/xmltramp/
import xmltramp

# Details needed to use the del.icio.us API
API_URL		= 'https://api.del.icio.us/v1'
API_USER	= 'XXX'
API_PASSWD	= 'YYY'

# Root path under which all backups will be stored.
POSTS_PATH	= 'del-posts'

# Unicode encoding to use while producing HTML
UNICODE_ENC = 'UTF-8'

# Overall HTML page template.
HTML_PAGE_TMPL = u"""
<html>
	<head>
		<title>Links for %(date)s</title>
		<meta http-equiv="Content-Type"	content="text/html; charset=%(unicode_enc)s" />
		<link href="../../../ch08_post_styles.css" type="text/css" rel="stylesheet" media="screen" />
	</head>
	
	<body>
		<h1>Links for %(date)s</h1>
		<ul class="delPosts" id="delPosts-%(date)s">
			%(posts)s
		</ul>
	</body>
</html>
"""

#HTML template for an individual link.
HTML_LINK_TMPL = u"""
	<li class="delPost" id="delPost-%(hash)s">
		<span class="delTime">%(time)s</span>
		<a class="delLink" href="%(href)s">%(description)s</a>
		<span class="delExtended">%(extended)s</span>
		<ul class="delTags">
			%(tags)s
		</ul>
	</li>
"""

# HTML template for a tag attached to a link
HTML_TAG_TMPL = u"""
	<li class="delTag">
		<a href="http://del.icio.us/%(user)s/%(tag)s">%(tag)s</a>
	</li>
"""

# 
def main():
	"""
	Backup all of a user's bookmarks by date, attepting to render
	an HTML page of each date along the way.
	"""
	
	# Get ready for calls to the del.icio.us API.
	initApi()
	
	# Create the backups path, if needed.
	if not os.path.isdir(POSTS_PATH): os.makedirs(POSTS_PATH)
		
	# Look up all the dates for which this users has bookmarks.
	print "Querying API for posting dates..."
	dates_data = xmlapi('posts/dates')
	open('%s/dates.xml' % POSTS_PATH, 'w').write(dates_data)
	
	# Vist the user's posts for each of the dates.
	for date in xmltramp.parse(dates_data):
		
		# Grab the date and drive the backup file path.
		dt = date('date')
		path = date2path(dt)
		
		# Skip this date if an XML backup already exists.
		if os.path.isfile('%s.xml' % path): continue
		
		# Create the parent directories for backup if necessary.
		dir = os.path.dirname(path)
		if not os.path.isdir(dir): os.makedirs(dir)
			
		# Catch any errors that happen from here on.
		try:
			
			# Make a query to the API for this date's bookmarks
			print "Backing up %s..." % dt
			posts_data = xmlapi('posts/get?dt=%s' % dt)
			open('%s.xml' % path, 'w').write(posts_data)
			
			# Parse and process each of the link posts retrieved.
			posts_out = []
			for post in xmltramp.parse(posts_data):
				
				# Render all of th post's tags using the tag template
				tags_out = [
					HTML_TAG_TMPL % TemplateSafeDict(
						user = API_USER,
						tag = tag
					)
					for tag in post('tag').split(' ')
				]
				
				# Start building a dict for the link template
				link_ns =  TemplateSafeDict(
					tags = ''.join(tags_out)
				)
				
				# Merge in all the parsed attributes for this post.
				link_ns.update(post._attrs)
				
				# Render the link post using the template.
				posts_out.append(HTML_LINK_TMPL % link_ns)
				
				# Print this link's title as progress indicator
				print "\t%s" % \
					post('description').encode(UNICODE_ENC)
				
			# Finally, build the overall page and write it out to disk
			page = HTML_PAGE_TMPL % TemplateSafeDict(
				posts = ''.join(posts_out),
				date = dt,
				unicode_enc = UNICODE_ENC
			)
			page = page.encode(UNICODE_ENC)
			open('%s.html' % path, 'w').write(page)
			
		except SAXParseException, e:
			# Rendering fails on XML errors, but at least there's a backup
			print "\tProblem parsing XML: %s" % e
			
		except urllib2.HTTPError, e:
			# The API call for posts failed altogether.
			print "\tProblem calling API: %s" % e
		
def initApi():
	"""Prepare for calls to the del.icio.us API"""
	# Setup urllib2 for del's Basic Authentication
	password_manager = urllib2.HTTPPasswordMgrWithDefaultRealm()
	password_manager.add_password(None, 'https://api.del.icio.us/', API_USER, API_PASSWD)
	auth = urllib2.HTTPBasicAuthHandler(password_manager)
	# auth.add_password('del.icio.us API', 'del.icio.us', API_USER, API_PASSWD)
	# auth_handler = urllib2.HTTPBasicAuthHandler(password_manager)
	opener = urllib2.build_opener(auth)
	urllib2.install_opener(opener)
	# urllib2.install_opener(urllib2.build_opener(auth))
	
def xmlapi(method):
	"""Perform a call to the del.icio.us API, returning XML"""
	time.sleep(1) # Enforce the 1 second delay between API calls.
	url = '%s/%s' % (API_URL, method)
	return urllib2.urlopen(url).read()
	
def date2path(dt):
	"""Convert a del.icio.us date into a backup file path."""
	y, m, d = dt.split('-')
	return '%s/%s/%s/%s' % (POSTS_PATH, y, m, d)
	
class TemplateSafeDict:
	"""A dict-like that's safe for dumb tempaltes."""
	def __init__(self, **kwargs):
		"""Initialize the new dict."""
		self.data = dict(**kwargs)
		
	def update(self, data):
		"""Update the dict with the new data"""
		self.data.update(data)
		
	def __repr__(self):
		"""Return the dict's representation"""
		return repr(self.data)
		
	def __setitem__(self, key, val):
		"""Set a valud in the dict."""
		self.data[key] = val
		
	def __getitem__(self, key):
		"""
		Get a value from the dict by key.  If no such key exists,
		just return a blank string.  Useful for dumb templates.
		"""
		if key in self.data:
			return self.data[key]
		else:
			return u''

# if being run as a script, fire up the main function.
if __name__ == '__main__': main()
	
	
	
