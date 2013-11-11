
// create globals to play with on client
$ = require('jquery')
WaveSurfer = require('wavesurfer');
PouchDB = require('pouchdb');
BackbonePouch = require('backbone-pouch');
Marionette = require('backbone.marionette');
Marionette.$ = $;
Backbone = require('backbone.marionette/node_modules/backbone');
Backbone.$ = $;
require('backbone-callbacks').attach(Backbone);
_ = require('underscore');
Math.uuid = require('node-uuid').v4;


debug = true;

Linx = require('./');
Linx.start();

// models
require('./players/tracks/Track.js');
require('./players/clips/Clip.js');
require('./players/Player.js');
require('./players/SimplePlayer.js');

// collections
require('./players/clips/ClipList.js');
require('./players/tracks/TrackList.js');

// player views
require('./players/clips/ClipView.js')
require('./players/clips/SimpleClipView.js')
require('./players/clips/ClipListView.js')
require('./players/clips/SimpleClipListView.js')
require('./players/tracks/TrackView.js')
require('./players/tracks/SimpleTrackView.js')
require('./players/tracks/TrackListView.js')
require('./players/tracks/SimpleTrackListView.js')
require('./players/PlayerView.js');
require('./players/SimplePlayerView.js');
