var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'title': '',
      'playback_count': 0,
      'duration': 0,
    }
  },

});