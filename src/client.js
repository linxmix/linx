
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

Linx = require('./');

debug = true;

// load the application once the DOM is ready, using `jQuery.ready`:
$(function () {

  // enable PouchDB debugging
  // Pouch.DEBUG = true;

  // adjust id attribute to the one PouchDB uses.
  Backbone.Model.prototype.idAttribute = '_id';

  var func = Marionette.Module._addModuleDefinition;
  Marionette.Module._addModuleDefinition = function(parentModule, module) {
      module.parent = parentModule;
      func.apply(this, arguments);
  };

  // credentials for CouchDB
  XMLHttpRequest.withCredentials = true
  // PouchDB.sync replaces default backbone sync
  Backbone.sync = BackbonePouch.sync({
    // suffix with version in case of necessary upgrade.
    db: PouchDB('linx3'),
    //db: PouchDB('http://localhost:5984/linx0'),
  });

  Linx.start();
});

// models
require('./library/Source.js');
require('./players/tracks/Track.js');
require('./players/clips/Clip.js');
require('./library/samples/Sample.js');
require('./library/samples/Transition.js');
require('./players/Player.js');
require('./library/Library.js');
require('./players/SimplePlayer.js');

// collections
require('./library/Index.js');
require('./players/clips/ClipList.js');
require('./players/tracks/TrackList.js');
require('./library/samples/SampleList.js');
require('./library/samples/TransitionList.js');

// modules
require('./library/');
require('./players/')

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

// library views
require('./library/samples/SampleView.js')
require('./library/samples/SampleListView.js')
require('./library/samples/TransitionListView.js')
require('./library/LibraryView.js');
