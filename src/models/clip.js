var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Clips', function (Clips, App, Backbone) {

  Clips.Clip = Backbone.Model.extend({
  
    'defaults': function () {
      return {
        'type': 'clip',
        'state': 'stop',
        'source': undefined,
      };
    },

    'initialize': function () {

      var defer = $.Deferred();
      this.ready = defer.promise();
      defer.resolve();
    },
  });
});