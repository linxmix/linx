var Backbone = require('backbone');
var debug = require('debug')('models:Widget_Wave');

var clientId = require('../config').clientId;
var apiServer = require('../utils').apiServer;

var Widget = require('./Widget');

var CUE_LAG = 0.005;

// TODO: port wave drawing and zooming from old linx project
module.exports = Widget.extend({

  // load given track into widget
  load: function (options) {
    var track = this.get('track');
    var wave = this.get('player');
    wave.track = track;

    // add defaults to options
    if (typeof options !== 'object') { options = {}; }
    this.set({
      'playState': 'stop',
      'loaded': false,
      'loading': true,
      // TODO: why does this not work? need to make sure
      //       track hasn't changed during loading (concurrency)
      'onLoaded': function (track) {
        //debug("ONLOADED", this, track.id);
        if (track.id !== this.get('track').id) {
          return false;
        } else {
          var cb = options.callback;
          cb && cb();
          return true;
        }
      }.bind(this, track),
    });
    debug("loading track into widget", this.get('index'), track.get('title'));

    // TODO: why does track.attributes work while track.get doesnt?
    // api server proxies /sc/* to https://api.soundcloud.com/*
    var url = apiServer + "/sc" +
      track.attributes['stream_url'].replace(/^https?:\/\/api.soundcloud.com/, '') +
      "?client_id=" + clientId;

    // load track into wave
    try {
      var ajax = wave.load(url);
      this.setXhr(ajax.xhr);
    } catch (e) {
      debug("CAUGHT ERROR WHILE LOADING", e);
    }
  },

  onReady: function () {
    var correct = this.get('onLoaded')();
    if (correct) {
      this.set({ 'loaded': true, 'loading': false });
      this.setVolume();
      this.assertPlayState();
      debug("WIDGET LOADED", this.get('track').get('title'));
      this.setTimingMarks();
    } else {
      debug("WIDGET LOADED INCORRECT")
    }
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

  getSelection: function () {
    var wave = this.get('player');
    return wave.getSelection();
  },

  //
  // marks
  //

  setHoverMark: function (event) {
    // only do this if we have a file buffer loaded
    var wave = this.get('player');
    if (wave.backend && wave.backend.buffer) {
      var e = event.nativeEvent;
      // extract mouse position from event
      var relX = e.offsetX;
      if (relX > 1) {
        var percent = (relX / wave.drawer.scrollWidth) || 0;
        // mark hover
        this.addMark({
          'id': 'hover',
          'percentage': percent,
          'color': 'rgba(255, 255, 255, 0.8)',
        });
      }
    }
  },

  clearHoverMark: function (event) {
    this.removeMark('hover');
  },

  setTimingMarks: function () {
    var track = this.get('track');
    if (track && this.get('loaded')) {
      var timing = track.get(this.get('timingKey')) || {};
      var startTime = timing['startTime'] || track.getDefaultStart();
      var endTime = timing['endTime'] || track.getDefaultEnd();
      debug("setting timing marks", track.get('title'), timing);
      this.addStartMark(startTime);
      this.addEndMark(endTime);
    } else {
      this.clearTimingMarks();
    }
  },

  clearTimingMarks: function () {
    var track = this.get('track');
    this.removeMark('start');
    this.removeMark('end');
  },

  addStartMark: function (position) {
    position = position + CUE_LAG;
    var wave = this.get('player');
    // seek to mark
    if (wave.backend && wave.backend.isPaused()) {
      this.seekTime(position);
    }
    var mark = wave.mark({
      'id': 'start',
      'position': position,
      'color': 'rgba(0, 255, 0, 1)',
    });
    if (mark) {
      wave.startMark = mark;
    }
  },

  addEndMark: function (position) {
    var wave = this.get('player');
    var mark = wave.mark({
      'id': 'end',
      'position': position,
      'color': 'rgba(255, 0, 0, 1)',
    });
    // add handler
    debug("MARKED END", position, this.get('track').get('title'));
    if (mark) {
      mark.on('reached', function () {
        wave.fireEvent('endMark', mark);
      }.bind(this));
    }
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

  addMark: function (options) {
    var wave = this.get('player');
    if (wave) {
      var mark = wave.mark(options);
      // add handlers if new mark
      if (mark) {
        mark.on('over', function (e) {
          e.offsetX = -100;
        }.bind(mark));
      }
    }
  },

  removeMark: function (mark) {
    var wave = this.get('player');
    if (wave) {
      try {
        switch (typeof mark) {
          case 'string':
            wave.markers[mark].remove(); break;
          case 'object':
            mark.remove(); break;
        }
      }
      catch (e) {}
    }
  },

});