var Backbone = require('backbone');
var debug = require('debug')('models:Widget_SC');

var Widget = require('./Widget');

module.exports = Widget.extend({

  // load given track into widget
  load: function (track, options) {
    if (!track) { debug('undefined track'); return; }

    // add defaults to options
    if (typeof options !== 'object') { options = {}; }
    options.single_active = false;

    // load widget
    var widget = this.get('widget');
    widget.load(track.get('uri'), options);

    // update widget with new trackId
    this.set({ 'trackId': track.get('id') });
  },

  assertPlayState: function (playState) {
    var widget = this.get('widget');
    widget.isPaused(function (isPaused) {
      if (isPaused) { // widget is paused
        if (playState === 'play') {
          widget.play();
        }
      } else if (playState !== 'play') { // widget is playing
        widget.pause();
      }
    });
  },

});