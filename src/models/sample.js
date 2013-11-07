var Linx = require('../app.js');

module.exports = Linx.module('Samples', function (Samples, App, Backbone) {

  Samples.Sample = Backbone.Model.extend({
  
    defaults: function () {
      return {
        'type': 'sample',
        'name': "unnamed sample",
      };
    },

    initialize: function () {
      if (! this.get("name")) {
        this.set({
          'type': this.defaults.type,
          'name': this.defaults.name,
        });
      }
    },
  });
});