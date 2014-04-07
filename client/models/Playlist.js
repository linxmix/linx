var Backbone = require('backbone');

var Tracks = require('../collections/Tracks');

module.exports = Backbone.Model.extend({

  defaults: function() {
    console.log("MAKING PLAYLIST MODEL", this);
    return {
      'name': 'playlist ' + this['cid'],
      'tracks': new Tracks(),
    };
  },

});