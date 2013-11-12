var PouchDB = require('pouchdb');
var BackbonePouch = require('backbone-pouch');
var Backbone = require('backbone.marionette/node_modules/backbone');

var Linx = new Backbone.Marionette.Application();

Linx.addRegions({
  header: '#header',
  player: '#player',
  library: '#library',
  footer: '#footer',
});

var waaclock = require('waaclock');

Linx.on('initialize:before', function () {
  // add global audio context
  try {
    Linx.audioContext = new (window.AudioContext || window.webkitAudioContext);
  } catch (e) {
    alert("This browser does not support Web Audio API. Try the latest version of Chrome!");
  }
  Linx.clock = new waaclock(Linx.audioContext);
});

module.exports = Linx;