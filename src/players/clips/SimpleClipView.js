var Linx = require('../../');

module.exports = Linx.module('Players.Tracks.Clips.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleClipView = Views.ClipView.extend({

    'initialize': function () {
      Views.ClipView.prototype.initialize.call(this);
      if (this.model.ready.state() === 'pending') {
        $.when(this.model.ready).done(this.render);
      }
    },

    'render': function () {
      if (debug) console.log('clip rendering source', this);
      // render the ClipView template
      this.$el.html(this.template(this.model.attributes));

      // if the model has a wave, render it
      var wave = this.model.wave;
      if (wave) {
        // set the wave container to be within our template
        var self = this;
        wave.setContainer = function () {
          wave.params.container = self.$('.source')[0];
          wave.createDrawer();
          wave.fireEvent('redraw');
          wave.drawBuffer();
        }
        // TODO: figure out why this only works after a delay
        setTimeout(function () {
          if (debug) { console.log("redrawing wave", wave); }
          wave.setContainer();
        }, 1000);
      }
      return this;
      },


    'onPlayPause': function () {
      this.model.wave.playPause();
    },

    'onStop': function () {
      this.wave.stop();
    },

  });
});