var Backbone = require('backbone');
var debug = require('debug')('models:Node')

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'x': null,
      'y': null,
      'r': 100,
      'color': 0,
    }
  },

});