var Backbone = require('backbone');
var debug = require('debug')('models:Node')

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'x': 0,
      'y': 0,
      'r': 100,
      'color': 0,
      'linxType': 'song',
      'track': null,
    }
  },

});