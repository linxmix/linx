var Backbone = require('backbone');

var Widget = require('./Widget');

module.exports = Widget.extend({

  // load given track into widget
  load: function (track, options) {

    // add defaults to options
    if (typeof options !== 'object') { options = {}; }
    options.single_active = false;

    // load widget
    var widget = this.get('widget');
    widget.load(track.get('uri'), options);

    // update widget with new trackId
    this.set({ 'trackId': track.get('id') });
  },

});