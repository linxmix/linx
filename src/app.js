var PouchDB = require('pouchdb');
var BackbonePouch = require('backbone-pouch');
var Backbone = require('backbone.marionette/node_modules/backbone');

var Linx = new Backbone.Marionette.Application();


Linx.addRegions({
  header: '#header',
  tracks: '#tracks',
  samples: '#samples',
  footer: '#footer',
});

Linx.on('initialize:after', function () {

});

module.exports = Linx;