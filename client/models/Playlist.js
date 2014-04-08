var Backbone = require('backbone');

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

});