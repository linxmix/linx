var Backbone = require('backbone');
var debug = require('debug')('collections:Queue')

var Track = require('../models/Track');
var Tracks = require('./Tracks');
var Widgets = require('./Widgets');

// TODO: allow duplicates in queue
module.exports = Tracks.extend({

  initialize: function(models, options) {
    this.on("add", function(track) {
      debug("added track to queue", track.get('title'), this.indexOf(track));
    }.bind(this));
    // curry options
    if (typeof options !== 'object') { options = { 'numWidgets': 1, }; }
    if (!options['id']) {
      throw new Error("Cannot make queue without an id");
    }
    this.id = options['id'];

    this.on('add', function (track, collection, options) {
      var index = collection.indexOf(track);
      // if added to front, decrement activeWidget
      if (index === 0) {
        this.getWidgets().decrementActiveWidget();
      }
      // set queue timing information
      this.setTiming(track, index);
      // resync widgets
      return this.syncWidgets();
    }.bind(this));

    this.on('remove', function (track, collection, options) {
      var index = options.index;
      // if removed from front, increment activeWidget
      if (index === 0) {
        this.getWidgets().incrementActiveWidget();
      }
      // unset queue timing information
      this.unsetTiming(track, index);
      // resync widgets
      return this.syncWidgets();
    }.bind(this));

    // make widgets equal to options.numWidgets
    var widgets = [];
    var timingKey = this.getTimingKey();
    for (var i = 0; i < options.numWidgets; i++) {
      widgets.push({ 'index': i, 'timingKey': timingKey });
    }

    // make widgets sub collection
    this.widgets = new Widgets(widgets);
    // make history sub collection
    this.history = new Tracks();
  },

  getPrev: function (index) {
    var prevIndex = index - 1;
    return (prevIndex > -1) && this.at(prevIndex);
  },

  getNext: function (index) {
    var nextIndex = index + 1;
    return (nextIndex < this.length) && this.at(nextIndex);
  },

  // removes adjacent queue members if they are transitions
  // returns 1 if prev was removed, else 0
  // TODO: unless nextNext or prevPrev still work for prev or next transition!
  removeTransitions: function (options) {
    var removed = 0;
    // curry options
    var prev = options['prev'];
    var next = options['next'];
    if (options['index']) {
      prev = this.getPrev(options['index']);
      next = this.getNext(options['index']);
    }
    // maybe remove prev
    if (prev && prev.get('linxType') === 'transition') {
      this.remove(prev);
      // update removed
      removed++;
    }
    // maybe remove next
    if (next && next.get('linxType') === 'transition') {
      this.remove(next);
    }
    return removed;
  },

  // add a single track to collection, must have option.at
  // returns track if successful, or false
  add: function (track, options) {
    if (track instanceof Array) {
      // TODO: add them in order
      // TODO: make this wait on previous add to finish
      return debug("ERROR: add given array instead of object", track);
    }
    if (!(options && (typeof options['at'] === 'number'))) {
      return debug("ERROR: queue.add not given correct options");
    }

    // get tracks for prev, next
    var prevTrack = this.getPrev(index);
    var nextTrack = this.getNext(index - 1); // -1 b/c track not yet added

    // if adding between transitions, remove them
    var index = options['at'];
    var prevTrack = this.getPrev(index);
    var nextTrack = this.getNext(index - 1); // -1 b/c track not yet added
    index -= this.removeTransitions({
      'prev': prevTrack,
      'next': nextTrack,
    });
    // refresh in case we changed index
    prevTrack = this.getPrev(index);
    nextTrack = this.getNext(index - 1); // -1 b/c track not yet added

    // if adding transition, make sure it fits
    if (track.get('linxType') === 'transition') {

      // first check prev
      var addPrev = function () {
        prevTrack = new Track({ 'id': track.getInId() });
        // don't wait for fetch if just a test
        if (process.env.NODE_ENV === "test") {
          Tracks.prototype.add.call(this, prevTrack, { 'at': index++ });
        // TODO: make sure this works for real deal
        } else {
          prevTrack.fetch({
            'success': function (model, response, options) {
              Tracks.prototype.add.call(this, prevTrack, { 'at': index++ });
            }.bind(this),
            'error': function (error) {
              throw new Error("ERROR fetching prevTrack", prevTrack, error);
            },
          });
        }
      }.bind(this);
      if (prevTrack && prevTrack.id === track.getInId()) {
        // id matches, so make sure timings will work
        var prevPrev = this.getPrev(index - 1);
        // no prevPrev, so prev must be queue head
        if (!prevPrev) {
          // TODO: what now? add position to site? or to track model?
          throw new Error("ERROR: adding transition to queue when prev is playing", this, track);
        }
        // prev is not playing, so check preceeding transition
        else if (prevPrev.get('linxType') === 'transition') {
          var timing = this.getTiming(prevTrack, {
            'prev': prevPrev,
            'next': track,
          });
          if (!timing) {
            // TODO: timing was impossible, what now?
            throw new Error("ERROR: adding transition to queue when prev is correct id but impossible timing", this, track);
          } else {
            // timing is possible. sweet!
          }
        }
      // incorrect prevTrack, so add
      } else {
        addPrev();
      }

      // then check next
      var addNext = function () {
        nextTrack = new Track({ 'id': track.getOutId() });
        // don't wait for fetch if just a test
        if (process.env.NODE_ENV === "test") {
          Tracks.prototype.add.call(this, nextTrack, { 'at': index + 1 });
        // TODO: make sure this works for real deal
        } else {
          nextTrack.fetch({
            'success': function (model, response, options) {
              Tracks.prototype.add.call(this, nextTrack, { 'at': index + 1 });
            }.bind(this),
            'error': function (error) {
              throw new Error("ERROR fetching nextTrack", nextTrack, error);
            },
          });
        }
      }.bind(this);
      if (nextTrack && nextTrack.id === track.getOutId()) {
        // id matches, so make sure timings will work
        var nextNext = this.getNext(index + 1);
        // no nextNext, so next must be queue tail
        if (!nextNext) {
          addNext();
        }
        // nextNext exists, so check succeeding transition
        else if (nextNext.get('linxType') === 'transition') {
          var timing = this.getTiming(nextTrack, {
            'prev': track,
            'next': nextNext,
          });
          if (!timing) {
            // TODO: timing was impossible, what now?
            throw new Error("WARNING: adding transition to queue when next is correct id but impossible timing", this, track);
          }
        }
      // incorrect nextTrack, so add
      } else {
        addNext();
      }

    } // /end adding transition

    // update index in case we changed the queue
    options['at'] = index;
    // and finally, add track
    Tracks.prototype.add.call(this, track, options);
    return;
  },

  remove: function (tracks, options) {
    if (!(tracks instanceof Array)) {
      tracks = [tracks]
    }
    // if removing song(s), remove corresponding transition(s)
    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      if (track.get('linxType') === 'song') {
        this.removeTransitions({
          'index': this.indexOf(track),
        });
      }
    }
    // call built-in remove
    return Tracks.prototype.remove.call(this, tracks, options);
  },

  unsetTiming: function (track, index) {
    // if removing transition, make sure to update prev and next
    if (track.get('linxType') === 'transition') {
      this.setTiming(this.getPrev(index));
      // Note: -1 because index is of removed track
      this.setTiming(this.getNext(index - 1));
    }
    // remove timings
    track.unset(this.getTimingKey());
  },

  // sets in and out timing based on current queue
  setTiming: function (track, index) {
    if (typeof index !== 'number') { index = this.indexOf(track); }

    // if transition, remember to fix other timings
    if (track.get('linxType') === 'transition') {
      var prev = this.getPrev(index);
      var next = this.getNext(index);
      prev && this.setTiming(prev, index - 1);
      next && this.setTiming(next, index + 1);
    }

    // set timing
    var timingKey = this.getTimingKey();
    var timing = {};
    timing[timingKey] = this.getTiming(track, { 'index': index });
    if (!timing[timingKey]) {
      throw new Error("ERROR: setting impossible timing", this, track);
    }
    track.set(timing);
  },

  getTiming: function (track, options) {
    var startTime = track.getDefaultStart();
    var endTime = track.getDefaultEnd();

    // if song, condition on possible transitions
    if (track.get('linxType') === 'song') {
      var prev = options['prev'];
      var next = options['next'];
      if (options['index']) {
        prev = this.getPrev(options['index']);
        next = this.getNext(options['index']);
      }
      // if prev is transition, use startOut
      if (prev && prev.get('linxType') === 'transition') {
        startTime = prev.getStartOut();
      }
      // if next is transition, use endIn
      if (next && next.get('linxType') === 'transition') {
        endTime = next.getEndIn();
      }
    }

    // return false if timing is impossible
    if (startTime >= endTime) {
      return false; 
    } else {
      return {
        'startTime': startTime,
        'endTime': endTime,
      }
    }

  },

  getTimingKey: function () {
    return 'timing:' + this.id;
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
    var track = this.shift();
    // add played track to front of history
    track && this.history.unshift(track);
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
      debug("widget and track were unsynced:", widget.get('index'), track.get('title'));
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