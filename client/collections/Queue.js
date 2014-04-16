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
      var index = collection.indexOf(track);
      // if adding to front, decrement activeWidget
      if (index === 0) {
        this.getWidgets().decrementActiveWidget();
      }
      return this.syncWidgets();
    }.bind(this));
    this.on('remove', function (track, collection, options) {
      var index = options.index;
      // if removing from front, increment activeWidget
      if (index === 0) {
        this.getWidgets().incrementActiveWidget();
      }
      return this.syncWidgets();
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
    // shift queue
    debug("SHIFT QUEUE");
    var track = this.shift();
    // add played track to front of history
    track && this.history.unshift(track);
    debug("TRIGGER CYCLE");
    this.trigger('cycle', this.at(0));
  },

  // TODO: add ability to reorder widgets to minimize load time
  // use queue to preload widgets
  isSyncing: false,
  syncWidgets: function (isContinuation) {
    // TODO: make this work
    if (this.isSyncing && !isContinuation) {
      return false;
    }
    debug("syncWidgets called", isContinuation);
    var widgets = this.getWidgets();
    var activeWidget = widgets.activeWidget;

    // do the queue sync: find incorrect widget and start from there
    var wrongWidget = null;
    for (var i = 0; i < widgets.length; i++) {
      var widgetIndex = (i + activeWidget) % widgets.length;
      var queueIndex = (widgetIndex + activeWidget) % widgets.length;

      // if queue index is beyond queue, quit
      // TODO: make it so we empty trailing widgets
      if (queueIndex >= this.length) {
        break;
      }

      // if incorrect track, set wrongWidget and break
      var widget = widgets.at(widgetIndex);
      var track = this.at(queueIndex);
      var trackId = track.get('id');
      var widgetTrack = widget.get('track');
      if (trackId !== (widgetTrack && widgetTrack.get('id'))) {
        wrongWidget = widget;
        break;
      }

    }

    // if there was an unsynced widget, start loading from there
    if (wrongWidget) {
      console.log("widget and track were unsynced:", widget.get('index'), track.get('title'));
      this.isSyncing = true;
      widget.setTrack(track, {
        'callback': function () {
          this.syncWidgets(true);
        }.bind(this),
      });
    // otherwise, we are done syncing
    } else {
      this.isSyncing = false
    }

  },

});