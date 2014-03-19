var Backbone = require('backbone');

var Track = require('./Track');
var Tracks = require('../collections/Tracks');
var Queue = require('../collections/Queue');

module.exports = Backbone.Model.extend({
  
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