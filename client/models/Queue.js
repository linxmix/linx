var Backbone = require('backbone');
var debug = require('debug')('models:Playlist');

var _ = require('underscore');

var Playlist = require('./Playlist');

module.exports = Playlist.extend({

  defaults: function () {
    var defaults = Playlist.prototype.defaults.apply(this, arguments);
    return _.defaults({
      'name': 'AppQueue',
      'type': 'queue',
    }, defaults);
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