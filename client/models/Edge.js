var Backbone = require('backbone');
var debug = require('debug')('models:Edge')

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'in': null,
      'edgeId': null,
      'out': null,
      'endIn': null,
      'startEdge': null,
      'endEdge': null,
      'startOut': null,
    }
  },

  sync: function (method, edge, options) {
    debug("calling sync", arguments);
    Backbone.sync.apply(this, arguments);
  },

});