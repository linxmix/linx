var Backbone = require('backbone');
var debug = require('debug')('models:Playlist');

var Tracks = require('../collections/Tracks');

module.exports = Backbone.Model.extend({

  defaults: function () {
    console.log("MAKING PLAYLIST MODEL", this);
    return {
      'name': 'playlist ' + this['cid'],
      'type': 'playlist',
      'tracks': new Tracks(),
    };
  },

  tracks: function () {
    return this.get('tracks').models;
  },

  add: function (track) {
    this.get('tracks').add(track);
  },

  queueAtPos: function (track, pos) {
    debug("queueingAtPos", track, pos)
  },

  // returns the widgets of this playlist's queue
  getWidgets: function () {
    debug("getting widgets");
    return this.get('queue').get('widgets');
  },

  // TODO: playlists need a queue collection and need play, pause, stop, back, forth

});