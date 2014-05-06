var Backbone = require('backbone');
var debug = require('debug')('models:Link')

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'color': 0,
      'track': null,
    }
  },

});