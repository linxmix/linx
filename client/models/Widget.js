var Backbone = require('backbone');
var debug = require('debug')('models:Widget');

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      index: null,
      track: null,
      player: null,
    };
  },

  setTrack: function (track, options) {
    this.set({ 'track': track });
    // load track into widget if we have a player
    if (this.get('player')) {
      this.load(options);
    }
  },

  setPlayer: function (player, options) {
    this.set({ 'player': player });
    // load track into widget if we have a track
    if (this.get('track')) {
      this.load(options);
    }
  },

  unsetPlayer: function () {
    this.unset('player');
  },

  assertPlayState: function (playState) {
    debug("asserting playstate", playState);

    if (playState === 'play') {
      this.play();
    } else if (playState === 'pause') {
      this.pause();
    } else if (playState === 'stop') {
      this.stop();
    }
  },

});