var Backbone = require('backbone');

var Track = require('./Track');
var Tracks = require('../collections/Tracks');

module.exports = Backbone.Model.extend({
  
  defaults: function () {
    return {
      id: null,
    };
  },

});