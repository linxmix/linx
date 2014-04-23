var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'id': null,
      'in': null,
      'out': null,
      'start': null,
      'end': null,
    }
  },

});