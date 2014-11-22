var Backbone = require('backbone');
var debug = require('debug')('models:Mix');

var _ = require('underscore');

var Playlist = require('./Playlist');

module.exports = Playlist.extend({

  defaults: function () {
    var defaults = Playlist.prototype.defaults.apply(this, arguments);
    return _.defaults({
      'name': 'mix ' + this['cid'],
      'linxType': 'mix',
      'tracks': null,
      'trackSort': null,
    }, defaults);
  },

  remove: function (tracks, options) {
    if (!(tracks instanceof Array)) {
      tracks = [tracks];
    }
    // if activeTrack is in tracks, remove activeTrack
    var activeTracks = this.getActiveTracks();
    if (tracks.indexOf(activeTracks[0]) > -1) {
      activeTracks = [];
    }

    // now do the actual removals
    debug("removing tracks from mix", tracks);
    this.tracks().remove(tracks, options);
    this.set({ 'activeTracks': activeTracks });
  },

  // cannot sort a mix
  setTrackSort: function (trackSort) {
    return;
  },

  getActiveTrack: function () {
    return this.getActiveTracks()[0];
  },

  setActiveTrack: function (track, options) {
    var activeTracks = [];
    if (track) { activeTracks.push(track); }
    return this.setActiveTracks(activeTracks, options);
  },

  // mixes have no tracks, only a queue
  tracks: function () {
    return this.get('queue');
  },

  // TODO?
  bufferQueue: function () {
    return;
  },

});
