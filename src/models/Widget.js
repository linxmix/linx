var Backbone = require('backbone');
var debug = require('debug')('models:Widget');

var _ = require('underscore');

var LOUDNESS = -10;
var VOL = Math.pow(10, -5 / 20)

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'index': null,
      'track': null,
      'player': null,
      'playState': 'stop',
      'loaded': false,
      'loading': false,
      'volumes': {
        'normalize': VOL,
        'master': 1,
      },
    };
  },

  equalizeVolume: function () {
    var track = this.get('track');
    var profile = track && track.get('echoProfile');
    if (track && profile) {
      var loudness;
      try {
        loudness = profile.audio_summary.loudness;
      } catch (e) { }
      var gain = LOUDNESS - loudness
      var vol = Math.pow(10, gain / 20);
      if (!isNaN(vol)) {
        this.setVolume('normalize', vol, true);
      }
    }
  },

  setVolume: function (type, level, lazy) {
    var volumes = this.get('volumes');
    if (type && (typeof level === 'number')) {
      volumes[type] = level;
      this.set({ 'volumes': volumes });
    }
    this.assertVolume(lazy);
  },

  assertVolume: function (lazy) {
    var volumes = this.get('volumes');
    var player = this.get('player');
    var doAssert = !lazy || (this.get('playState') !== 'play');
    if (player && doAssert) {
      var endVol = 1;
      // adjust endVol for each in volumes
      _.values(volumes).forEach(function (vol) {
        endVol *= vol;
      });
      debug("asserting volume", endVol);
      player.setVolume(endVol);
    }
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
    this.resetListener(prevTrack);
  },

  resetListener: function (prevTrack) {
    if (prevTrack) {
      this.stopListening(prevTrack);
    }
    var track = this.get('track');
    if (track) {
      var cb = function () {
        debug('onAnalyzed', this);
        this.setTimingMarks();
        this.equalizeVolume();
      }.bind(this);
      if (track.get('analyzed')) {
        cb();
      } else {
        // TODO: also need to listen to change of timing marks
        this.listenTo(track, 'change:analyzed', cb)
      }
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

  setXhr: function (xhr) {
    var prevXhr = this.get('xhr');
    // cancel prevXhr if still loading
    if (prevXhr && prevXhr.readyState < 4) {
      this.unset('xhr');
      prevXhr.abort();
    }
    this.set({ 'xhr': xhr });
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