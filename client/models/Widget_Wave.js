var Backbone = require('backbone');
var debug = require('debug')('models:Widget_Wave');

var clientId = require('../config').clientId;

var Widget = require('./Widget');

module.exports = Widget.extend({

  // load given track into widget
  load: function (track, options) {
    debug("loading track into widget", track);

    // add defaults to options
    if (typeof options !== 'object') { options = {}; }

    // make CORS-proxy URL
    var url = "http://localhost:5001/" +
      track.attributes['stream_url'].replace(/^https:\/\//, '') +
      "?client_id=" + clientId;

    // load track into wave
    var wave = this.get('widget');
    wave.load(url);
    // call callback on load if callback exists
    if (options.callback) {
      wave.once('loaded', function () {
        { options.callback(); }
      });
    }

    // update widget with new trackId
    this.set({ 'trackId': track.attributes['id'] });
  },

  play: function () {
    var wave = this.get('widget');
    wave.play();
  },

  pause: function () {
    var wave = this.get('widget');
    wave.pause();
  },

  stop: function () {
    var wave = this.get('widget');
    wave.stop();
  },

  redraw: function () {
    var wave = this.get('widget');
    debug("redraw", wave);
    // only draw if we have something to draw
    if (wave && wave.backend.buffer) {
      wave.fireEvent('redraw');
      wave.drawBuffer();
    }
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