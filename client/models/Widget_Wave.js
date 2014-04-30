var Backbone = require('backbone');
var debug = require('debug')('models:Widget_Wave');

var clientId = require('../config').clientId;

var Widget = require('./Widget');

var CUE_LAG = 0.005;

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
    debug("PLAYING WIDGET", this);
    var wave = this.get('player');
    wave && wave.backend.isPaused() && wave.play();
  },

  pause: function () {
    debug("PAUSING WIDGET", this);
    var wave = this.get('player');
    wave && !(wave.backend.isPaused()) && wave.pause();
  },

  stop: function () {
    debug("STOPPING WIDGET", this);
    var wave = this.get('player');
    try {
      wave && wave.stop();
    } catch (e) { }
  },

  seek: function (percent) {
    var wave = this.get('player');
    wave && wave.seekTo(percent);
  },

  seekTime: function (seconds) {
    var wave = this.get('player');
    // scale seconds to percent
    if (wave) {
      var percent = seconds / wave.timings()[1]
      wave.seekTo(percent);
    }
  },

  empty: function () {
    debug("EMPTYING WIDGET", this);
    var wave = this.get('player');
    if (wave) {
      wave.empty();
      this.unset('track');
      wave.fireEvent('empty');
    }
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

  setTimingMarks: function () {
    var track = this.get('track');
    if (track && this.get('loaded')) {
      var timing = track.get(this.get('timingKey')) || {};
      var startTime = timing['startTime'] || track.getDefaultStart();
      var endTime = timing['endTime'] || track.getDefaultEnd();
      debug("setting timing marks", track.get('title'), startTime, endTime);
      this.addStartMark(startTime);
      this.addEndMark(endTime);
    } else {
      this.clearTimingMarks();
    }
  },

  clearTimingMarks: function () {
    var track = this.get('track');
    debug("CLEARING TIMING MARKS", track && track.get('title'));
    var wave = this.get('player');
    if (wave) {
      if (wave.startMark) {
        wave.startMark.remove();
        delete wave.startMark;
      }
      if (wave.endMark) {
        wave.endMark.remove();
        delete wave.endMark;
      }
    }
  },

  addStartMark: function (position) {
    position = position + CUE_LAG;
    var wave = this.get('player');
    // seek to mark
    if (wave.backend && wave.backend.isPaused()) {
      this.seekTime(position);
    }
    wave.startMark = wave.mark({
      'id': 'startMark',
      'position': position,
      'color': 'rgba(0, 255, 0, 1)',
    });
  },

  addEndMark: function (position) {
    var wave = this.get('player');
    var mark = wave.endMark = wave.mark({
      'id': 'endMark',
      'position': position,
      'color': 'rgba(255, 0, 0, 1)',
    });
    // add handler
    mark.un('reached');
    mark.on('reached', function () {
      debug("MARK REACHED", this);
      this.get('player').fireEvent('finish');
    }.bind(this));
  },

  drawBeatGrid: function () {
    var track = this.get('track');
    var analysis = track && track.get('echoAnalysis');
    var wave = this.get('player');
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
    var wave = this.get('player');
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