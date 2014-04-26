var Backbone = require('backbone');
var debug = require('debug')('models:Widget_Wave');

var clientId = require('../config').clientId;

var Widget = require('./Widget');

// TODO: port wave drawing and zooming from old linx project
module.exports = Widget.extend({

  // load given track into widget
  load: function (options) {
    // add defaults to options
    if (typeof options !== 'object') { options = {}; }
    this.onLoaded = options.callback;
    this.set({ 'playState': 'stop', 'loaded': false });
    var track = this.get('track');
    var wave = this.get('player');
    debug("loading track into widget", this.get('index'), track.get('title'));

    // TODO: why does track.attributes work while track.get doesnt?
    var url = "http://localhost:5001/" +
      track.attributes['stream_url'].replace(/^https:\/\//, '') +
      "?client_id=" + clientId;

    // load track into wave
    wave.load(url);
  },

  onReady: function () {
    this.set({ 'loaded': true });
    this.assertPlayState();
    debug("WIDGET LOADED", this.get('track').get('title'));
    this.onLoaded && this.onLoaded();
    this.setTimingMarks();
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

  //
  // marks
  //

  // TODO: also call this when timings change. maybe add track listeners?
  setTimingMarks: function () {
    var track = this.get('track');
    var timing = track && track.get(this.get('timingKey'));
    if (timing) {
      debug("SETTING TIMING MARKS", track.get('title'), timing);
      this.addStartMark(timing['startTime']);
      this.addEndMark(timing['endTime']);
    } else {
      this.clearTimingMarks();
    }
  },

  clearTimingMarks: function () {
    var track = this.get('track');
    debug("CLEARING TIMING MARKS", track && track.get('title'));
    var wave = this.get('player');
    if (wave.startMark) {
      wave.startMark.remove();
      delete wave.startMark;
    }
    if (wave.endMark) {
      wave.endMark.remove();
      delete wave.endMark;
    }
  },

  addStartMark: function (position) {
    var wave = this.get('player');
    wave.startMark = wave.mark({
      'id': 'startMark',
      'position': position,
      'color': 'rgba(0, 255, 0, 1)',
    });
  },

  addEndMark: function (position) {
    var wave = this.get('player');
    wave.endMark = wave.mark({
      'id': 'endMark',
      'position': position,
      'color': 'rgba(255, 0, 0, 1)',
    });
  },

  drawBeatGrid: function () {
    var track = this.get('track');
    var analysis = track && track.get('echoAnalysis');
    var wave = this.get('wave');
    var thresh = 0.5;
    if (analysis && wave) {
      debug("adding beatgrid to wave", track.get('title'));
      analysis['beats'].forEach(function (beat) {
        if (beat['confidence'] >= thresh) {
          this.addBeatMark(beat['start']);
        }
      }.bind(this));
    }
  },

  drawMatches: function () {
    // draw matches
    var track = this.get('track');
    var matches = track && track.get('matches');
    var wave = this.get('wave');
    if (matches && wave) {
      debug("adding matches to wave", track.get('title'));
      matches.forEach(function (match) {
        this.addMatchMark(match);
      }.bind(this));
    }
  },

  addBeatMark: function (position) {
    var wave = this.get('player');
    wave.mark({
      'position': position,
      'color': 'rgba(0, 0, 0, 1)',
    });
  },

  addMatchMark: function (position) {
    var wave = this.get('player');
    wave.mark({
      'position': position,
      'color': 'rgba(255, 255, 255, 1)',
    });
  },

  getSelection: function () {
    var wave = this.get('player');
    return wave.getSelection();
  },

});


    /* OLD XHR CANCEL CODE
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
*/