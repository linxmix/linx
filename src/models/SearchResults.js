var Backbone = require('backbone');
var debug = require('debug')('models:Playlist');

var Playlist = require('./Playlist');

module.exports = Playlist.extend({

  defaults: function () {
    var attributes = Playlist.prototype.defaults.apply(this, arguments);
    attributes['linxType'] = 'searchResults';
    attributes['name'] = 'Search Results';
    return attributes;
  },

  // cannot add or remove from searchResults
  add: function (track) { },
  remove: function (track) { },

});