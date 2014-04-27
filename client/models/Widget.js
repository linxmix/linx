var Backbone = require('backbone');
var debug = require('debug')('models:Widget');

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'index': null,
      'track': null,
      'player': null,
      'playState': 'stop',
      'loaded': false,
      'position': 0,
    };
  },

  setTrack: function (track, options) {
    var prevTrack = this.get('track');
    this.set({
      'track': track,
      'options': options || this.get('options'),
    });
    // load track into widget if we have a player
    if (this.get('player')) {
      this.load(this.get('options'));
    }
    // setup track listeners
    this.setTrackListeners(prevTrack);
  },

  setTrackListeners: function (prevTrack) {
    var track = this.get('track');
    var key = 'change:' + this.get('timingKey');
    // remove handler from prev
    if (prevTrack && this.onChangeTiming) {
      prevTrack.off(key, this.onChangeTiming);
    }
    // update timing on track timing change
    var onChangeTiming = this.onChangeTiming || function onChangeTiming(newTiming) {
      debug('onChangeTiming', this, newTiming);
      if (this.get('loaded')) {
        this.setTimingMarks();
      }
    }.bind(this);
    // add handler to new
    if (track) {
      track.on(key, onChangeTiming);
    }
  },

  setPlayer: function (player, options) {
    this.set({
      'player': player,
      'options': options || this.get('options'),
    });
    // load track into widget if we have a track
    if (this.get('track')) {
      this.load(this.get('options'));
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
    this.set({
      'playState': 'stop',
      'loaded': false,
    });
  },

});