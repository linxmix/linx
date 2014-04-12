var Backbone = require('backbone');
var debug = require('debug')('models:Widget');

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      index: null,
      track: null,
      player: null,
      playState: 'stop',
      loaded: false,
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

  setPlayState: function (newState) {
    if (this.get('playState') !== newState) {
      this.set({ 'playState': newState });
      // assert playstate on change unless unloaded
      if (this.get('player') && this.get('loaded')) {
        this.assertPlayState();
      }
    }
  },

  assertPlayState: function () {
    var playState = this.get('playState');
    debug("asserting playstate", playState);
    switch (playState) {
      case 'play': this.play(); break;
      case 'pause': this.pause(); break;
      case 'stop': this.stop(); break;
      default: debug("WARNING: unknown playState", playState);
    }
  },

  unsetPlayer: function () {
    this.unset('player');
  },

});