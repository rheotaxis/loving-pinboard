#!/usr/bin/env ruby
##############################################################
# ch03_rubilicious_example.rb
##############################################################
DEL_USER   = 'yourusername'
DEL_PASSWD = 'yourpassword'

require 'rubilicious'

api = Rubilicious.new(DEL_USER, DEL_PASSWD)

puts "Posting bookmark."
api.add(
    'http://decafbad.com',
    '0xDECAFBAD',
    "Friends don't let friends drink decaf.",
    'programming coffee caffeine'
)

puts "Deleting bookmark."
api.delete('http://decafbad.com')

puts "Recent posts:"
api.recent().each { |post| 
    puts "\t#{post['description']}"
}

puts "Top 10 tags:"
api.tags().sort{ |a,b| b[1]<=>a[1] }.slice(0..10).each{ |tag|
    puts "\t#{tag[0]} - #{tag[1]}"
}
