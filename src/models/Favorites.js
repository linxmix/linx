var Backbone = require('backbone');
var debug = require('debug')('models:Playlist');

var Playlist = require('./Playlist');

module.exports = Playlist.extend({

  defaults: function () {
    var attributes = Playlist.prototype.defaults.apply(this, arguments);
    attributes['type'] = 'favorites';
    attributes['name'] = 'SoundCloud Favorites';
    return attributes;
  },

  // cannot conventionally add or remove from favorites
  add: function (track) { },
  remove: function (track) { },

});