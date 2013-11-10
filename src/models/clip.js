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
      if (debug) {
        console.log('initing clip', this);
        this.on('all', function (name) {
          console.log("clip event: ", name);
        });
      }

      // TODO: make clip get and attach source before ready
      var defer = $.Deferred();
      this.ready = defer.promise();
      if (debug) console.log("clip ready", self);
      defer.resolve();
    },
  });
});