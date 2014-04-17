var Backbone = require('backbone');
var debug = require('debug')('models:Playlist');

var Playlist = require('./Playlist');

module.exports = Playlist.extend({

  defaults: function () {
    return {
      'name': 'AppQueue',
      'type': 'queue',
    };
  },

  // queue has no tracks collection => delegate to queue
  tracks: function () {
    return this.get('queue');
  },

  // no-op since Queue already buffers all tracks
  bufferQueue: function () {
    return;
  },

});