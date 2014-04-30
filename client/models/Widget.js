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
    this.newTrack(prevTrack);
  },

  newTrack: function (prevTrack) {
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
    // analyze new track on track change
    this.analyze();
    // add handler to new
    if (track) {
      track.on(key, onChangeTiming);
    }
  },

  analyze: function (options) {
    options = options ? options : {
      'fullAnalysis': true,
      'success': function (track) {
        //this.drawBeatGrid();
        this.setTimingMarks();
      }.bind(this),
    };
    var track = this.get('track');
    if (track) {
      track.analyze(options);
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