var Backbone = require('backbone');
var debug = require('debug')('collections:Queue')

var Tracks = require('./Tracks');
var Widgets = require('./Widgets');

module.exports = Tracks.extend({

  initialize: function(models, options) {
    this.on("add", function(track) {
      debug("added track to queue", track.get('title'), this.indexOf(track));
    }.bind(this));
    // curry options
    if (typeof options !== 'object') { options = { 'numWidgets': 1, }; }

   // setup queue listeners
    this.on('add', function (track, collection, options) {
      return this.syncWidgets('add', track, collection.indexOf(track));
    }.bind(this));
    this.on('remove', function (track, collection, options) {
      return this.syncWidgets('remove', track, options.index);
    }.bind(this));

    // make widgets equal to options.numWidgets
    var widgets = [];
    for (var i = 0; i < options.numWidgets; i++) {
      widgets.push({ 'index': i });
    }

    // make widgets sub collection
    this.widgets = new Widgets(widgets);
    // make history sub collection
    this.history = new Tracks();
  },

  getWidgets: function () {
    return this.widgets;
  },

  getHistory: function () {
    return this.history;
  },

  getActiveWidget: function (offset) {
    return this.getWidgets().getActiveWidget(offset);
  },

  // TODO: this needs to use history to go to last song if there is one, or return false
  back: function () {
    debug("back");
    return false;
  },

  cycleQueue: function () {
    debug("cycleQueue");
    // increment activeWidget
    this.getWidgets().incrementActiveWidget();
    // shift queue
    var track = this.shift();
    // add played track to front of history
    track && this.history.unshift(track);
    this.trigger('changeTrack', this.at(0));
  },

  // TODO: add ability to reorder widgets
  // TODO: this should load widgets inorder
  // use queue to preload widgets
  isSyncing: false,
  syncWidgets: function (action, track, index) {
    debug("syncWidgets called", action, track, index, this);
    // TODO: see if this isSyncing thing does anything
    //if (this.isSyncing) { return; }
    this.isSyncing = true;

    var widgets = this.getWidgets();
    var activeWidget = widgets.activeWidget;

    /* TODO: do this, be smart about cycleQueue

    // if adding to front, decrement activeWidget
    if (action === 'add' && index === 0) {
      activeWidget = widgets.incrementActiveWidget();
    }

    // if removing from front, increment activeWidget
    else if (action === 'remove' && index === 0) {
      activeWidget = widgets.decrementActiveWidget();
    }
    */

    // now do the queue sync
    // make sure each widget has correct track loaded
    widgets.forEach(function (widget) {
      var widgetIndex = widget.get('index');
      var queueIndex = (widgetIndex + activeWidget) % widgets.length;

      // if queue index is beyond queue, empty this widget and quit
      if (queueIndex >= this.length) {
        widget.empty();
        return;
      }

      // if incorrect track, load correct track
      var track = this.at(queueIndex);
      var trackId = track.get('id');
      var widgetTrack = widget.get('track');
      if (trackId !== (widgetTrack && widgetTrack.get('id'))) {
        console.log("widget and track were unsynced:", widget, track);
        widget.setTrack(track);
      }

    }.bind(this)); // /end sync

    this.isSyncing = false;

  },

});