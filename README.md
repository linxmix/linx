beatfn
======

music player which plays like a dj mix that you control

// here's some quick info, transcribed from an email
it's basically an app that plays a live dj mix, except that you choose the songs
beatfn.meteor.com
you have to use it in chrome - i'm using a new web audio api which only chrome supports atm (actually there are rumors safari and firefox might also support it, but im not sure)
also since it's illegal to stream music for which i'm not paying royalties, i locked out the generic user => you have to log into the test account to play music
uname: test
pword: fairuse
double click either a song name (on the right) or a song in the graph (one of the red circles) to play a song
it takes a bit to load, so be somewhat patient
after you've selected a song, the graph should clean up and only display that song - the blue node is the currently playing song, the blue line is the upcoming transition
green nodes are queued songs, red nodes are not queued but are possible to play
so you can build your queue of songs double clicking the red nodes
the arrows indicate possible transitions
this is all very experimental so you might run into bugs, and also sometimes the audio skips and/or decreases/increases in volume... you have been warned 
if something confuses you or you do something that breaks it, please tell me! and screen shot it
you won't break the server side (well i dont THINK you will, lol), so if you get a bug all you have to do is refresh the page and it should reset
