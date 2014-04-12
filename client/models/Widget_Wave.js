var Backbone = require('backbone');
var debug = require('debug')('models:Widget_Wave');

var clientId = require('../config').clientId;

var Widget = require('./Widget');

  // TODO: import all my functions from old linx project

module.exports = Widget.extend({

  // TODO: why does track.attributes work while track.get doesnt?
  // load given track into widget
  load: function (options) {
    this.set({
      'playState': 'stop',
      'loaded': false,
    });
    var track = this.get('track');
    var wave = this.get('player');
    debug("loading track into widget", track, this);

    // add defaults to options
    if (typeof options !== 'object') { options = {}; }

    // make CORS-proxy URL
    var url = "http://localhost:5001/" +
      track.attributes['stream_url'].replace(/^https:\/\//, '') +
      "?client_id=" + clientId;

    // TODO: add other handlers as params to options?
    // load track into wave
    wave.once('ready', function () {
      this.set({ 'loaded': true });
      this.assertPlayState();
      debug("WIDGET LOADED");
    }.bind(this));
    wave.load(url);
  },

  play: function () {
    console.log("PLAYING WIDGET", this);
    var wave = this.get('player');
    wave.play();
  },

  pause: function () {
    console.log("PAUSING WIDGET", this);
    var wave = this.get('player');
    wave.pause();
  },

  stop: function () {
    console.log("STOPPING WIDGET", this);
    var wave = this.get('player');
    wave.stop();
  },

  seek: function (percent) {
    var wave = this.get('player');
    wave.seekTo(percent);
  },

  empty: function () {
    var wave = this.get('player');
    wave.empty();
  },

  redraw: function () {
    var wave = this.get('player');
    debug("redraw", wave);
    // only draw if we have something to draw
    if (wave && wave.backend.buffer) {
      wave.fireEvent('redraw');
      wave.drawBuffer();
    }
  },

});