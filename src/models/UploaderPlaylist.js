var Backbone = require('backbone');
var debug = require('debug')('models:UploaderPlaylist');

var Playlist = require('./Playlist');

module.exports = Playlist.extend({

  defaults: function () {
    var attributes = Playlist.prototype.defaults.apply(this, arguments);
    attributes['linxType'] = 'uploaderPlaylist';
    attributes['name'] = 'Uploader Playlist';
    return attributes;
  },

  add: function(tracks, options) {
    tracks && tracks.forEach(function(track) {
      track.analyze({ 'full': true });
    });
    return Playlist.prototype.add.apply(this, arguments);
  },

});
