var Backbone = require('backbone');
var debug = require('debug')('models:Widget_Wave');

var clientId = require('../config').clientId;

var Widget = require('./Widget');

  // TODO: import all my functions from old linx project

module.exports = Widget.extend({

  // TODO: why does track.attributes work while track.get doesnt?
  // load given track into widget
  load: function (options) {
    // set loading state
    this.set({
      'playState': 'stop',
      'loaded': false,
    });
    var track = this.get('track');
    var wave = this.get('player');
    debug("loading track into widget", this.get('index'), track.get('title'));

    // cancel any previous loading
    var xhr = this.get('xhr');
    if (xhr) {
      debug("CANCELLING XHR", track.get('title'))
      xhr.abort();
      this.unset('xhr');
    }
    // store new xhr
    var onLoading = function (percent, xhr) {
      if (xhr) {
        this.set({ 'xhr': xhr });
        wave.un('loading', onLoading);
      }
    }.bind(this);
    wave.on('loading', onLoading);
    // callback to remove this.xhr
    wave.once('loaded', function () {
      this.unset('xhr');
    }.bind(this));
    // add defaults to options
    if (typeof options !== 'object') { options = {}; }

    // make CORS-proxy URL
    var url = "http://localhost:5001/" +
      track.attributes['stream_url'].replace(/^https:\/\//, '') +
      "?client_id=" + clientId;

    // update onReady handlers
    if (this.onReady) {
      console.log("REMOVING ONREADY")
      wave.un('ready', this.onReady);
    }
    var onReady = this.onReady = function () {
      this.onReady = null;
      this.set({ 'loaded': true });
      this.assertPlayState();
      debug("WIDGET LOADED", track.get('title'), options.callback);
      options.callback && options.callback();
    }.bind(this);
    wave.on('ready', onReady);

    // load track into wave
    wave.load(url);
  },

  play: function () {
    console.log("PLAYING WIDGET", this);
    var wave = this.get('player');
    wave && wave.play();
  },

  pause: function () {
    console.log("PAUSING WIDGET", this);
    var wave = this.get('player');
    wave && wave.pause();
  },

  stop: function () {
    console.log("STOPPING WIDGET", this);
    var wave = this.get('player');
    wave && wave.stop();
  },

  seek: function (percent) {
    var wave = this.get('player');
    wave && wave.seekTo(percent);
  },

  empty: function () {
    var wave = this.get('player');
    wave && wave.empty();
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