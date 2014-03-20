var Backbone = require('backbone');

var Track = require('./Track');
var Tracks = require('../collections/Tracks');
var clientId = require('../config').clientId;

module.exports = Backbone.Model.extend({

  url: function () {
    return "https://api.soundcloud.com/users/" + this.id +
      "?client_id=" + clientId;
  },
  
  defaults: function () {
    return {
      id: null,
    };
  },

  tracks: function () {
    return new Tracks({
      userId: this.id,
    });
  },

});