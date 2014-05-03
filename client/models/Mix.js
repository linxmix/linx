var Backbone = require('backbone');
var debug = require('debug')('models:Mix');

var _ = require('underscore');

var Playlist = require('./Playlist');

module.exports = Playlist.extend({

  defaults: function () {
    var defaults = Playlist.prototype.defaults.apply(this, arguments);
    return _.defaults({
      'name': 'mix ' + this['cid'],
      'type': 'mix',
      'tracks': null,
      'trackSort': null,
    }, defaults);
  },

  // cannot sort a mix
  setTrackSort: function (trackSort) {
    return;
  },

  // mixes have no tracks, only a queue
  tracks: function () {
    return this.get('queue');
  },

  // TODO
  bufferQueue: function () {
    return;
  },

});