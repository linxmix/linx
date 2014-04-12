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

  add: function (track) {
    this.queue(track);
  },

  remove: function (track) {
    this.dequeue(track);
  },

});