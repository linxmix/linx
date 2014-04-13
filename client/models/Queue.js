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
    return this.get('queue').models;
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
  },

  remove: function (track) {
    this.dequeue(track);
  },

});