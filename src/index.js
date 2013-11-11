var PouchDB = require('pouchdb');
var BackbonePouch = require('backbone-pouch');
var Marionette = require('backbone.marionette');
var Backbone = require('backbone.marionette/node_modules/backbone');

var Linx = new Backbone.Marionette.Application();

// require all our modules
Linx.library = require('./library');
Linx.players = require('./players');

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

Linx.addRegions({
  header: '#header',
  player: '#player',
  libraryRegion: '#library',
  footer: '#footer',
});

Linx.on('initialize:before', function () {
  // add global audio context
  try {
    Linx.audioContext = new (window.AudioContext || window.webkitAudioContext);
  } catch (e) {
    alert("This browser does not support Web Audio API. Try the latest version of Chrome!");
  }
});

module.exports = Linx;
