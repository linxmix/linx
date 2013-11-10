
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

Linx = require('./app.js');

debug = true

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
require('./models/source.js');
require('./models/track.js');
require('./models/clip.js');
require('./models/sample.js');
require('./models/player.js');
require('./models/library.js');
require('./models/simplePlayer.js');

// collections
require('./collections/index.js');
require('./collections/clipList.js');
require('./collections/trackList.js');
require('./collections/sampleList.js');

// controllers
require('./controllers/librarian.js');

// modules
require('./modules/players.js')

// player views
require('./views/clip.js')
require('./views/simpleClip.js')
require('./views/clipList.js')
require('./views/simpleClipList.js')
require('./views/track.js')
require('./views/simpleTrack.js')
require('./views/trackList.js')
require('./views/simpleTrackList.js')
require('./views/player.js');
require('./views/simplePlayer.js');

// library views
require('./views/sample.js')
require('./views/sampleList.js')
require('./views/library.js');
