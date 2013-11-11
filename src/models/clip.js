var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Clips', function (Clips, App, Backbone, Marionette, $, _) {

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
        this.on('all', function () {
          console.log("clip event: ", arguments);
        });
      // reassert state on state change
      this.on('change:state', this.assertState);
      }

      // get and attach source before ready
      var defer = $.Deferred();
      this.ready = defer.promise();
      this.source = App.Library.library.index.get(this.get('source'));
      // TODO: generalize arguments for retrieving source
      var self = this;
      this.source.getSource({
        'container': '#emptyWaves',
        'audioContext': App.audioContext,
      }, function (err, wave) {
        if (err) { throw err; }
        self.wave = wave;
        if (debug) console.log("clip ready", self);
        defer.resolve();
      });
    },
  });

});