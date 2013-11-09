
// create globals to play with on client
$ = require('jquery')
WaveSurfer = require('wavesurfer');
PouchDB = require('pouchdb');
BackbonePouch = require('backbone-pouch');
Marionette = require('backbone.marionette');
Marionette.$ = $;
Backbone = require('backbone.marionette/node_modules/backbone');
Backbone.$ = $;
_ = require('underscore');
Math.uuid = require('node-uuid').v4;

Linx = require('./app.js');

// load the application once the DOM is ready, using `jQuery.ready`:
$(function () {

  // enable PouchDB debugging
  // Pouch.DEBUG = true;

  // adjust id attribute to the one PouchDB uses.
  Backbone.Model.prototype.idAttribute = '_id';

  Backbone.sync = BackbonePouch.sync({
    // suffix with version in case of necessary upgrade.
    db: PouchDB('linx1'),
  });

  Linx.start();
});

// models
require('./models/source.js');
require('./models/track.js');
require('./models/simpleTrack.js');
require('./models/clip.js');
require('./models/sample.js');
require('./models/player.js');
require('./models/simpleLibrary.js');
require('./models/simplePlayer.js');

// collections
require('./collections/index.js');
require('./collections/clipList.js');
require('./collections/trackList.js');
require('./collections/simpleTrackList.js');
require('./collections/sampleList.js');

// controllers
require('./controllers/librarian.js');
require('./controllers/conductor.js');

// views
require('./views/track.js')
require('./views/simpleTrack.js')
require('./views/clip.js')
require('./views/sample.js')
require('./views/trackList.js')
require('./views/simpleTrackList.js')
require('./views/sampleList.js')
require('./views/player.js');
require('./views/simpleLibrary.js');
require('./views/simplePlayer.js');
