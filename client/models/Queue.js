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

  tracks: function () {
    return this.get('queue');
  },

  onTrackChange: function (callback) {
    this.get('queue').on('add', function (track, options) {
      callback('add', track, options);
    });
    this.get('queue').on('remove', function (track, options) {
      callback('remove', track, options);
    });
  },

  // TODO: make this actually work
  offTrackChange: function (callback) {
    this.get('queue').off('add', function (track, options) {
      callback('add', track, options);
    });
    this.get('queue').off('remove', function (track, options) {
      callback('remove', track, options);
    });
  },

  add: function (track) {
    this.queue(track);
    // if queue was empty, reset activeTrack to default
    if (this.tracks().length === 1) {
      this.setDefaultTrack();
    }
  },

  remove: function (track) {
    // TODO: test this
    // if removing activeTrack, reset to default
    if (track === this.get('activeTrack')) {
      this.setDefaultTrack();
    }
    this.dequeue(track);
  },

});