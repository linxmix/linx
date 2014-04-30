var Backbone = require('backbone');
var debug = require('debug')('collections:Queue')

var _ = require('underscore');

var Track = require('../models/Track');
var Tracks = require('./Tracks');
var Widgets = require('./Widgets');

var nodeQueue = require('queue');
var results = [];

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
      // TODO: make this work
      // if added to front, decrement activeWidget
      //if (index === 0) {
      //  this.getWidgets().decrementActiveWidget();
      //}
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

    // setup execution queue which processes queue changes in order
    var q = this.q = nodeQueue({
      'timeout': 1900,
      'concurrency': 1,
    });
    q.on('timeout', function(next, job) {
      debug('job timed out:', job.toString().replace(/\n/g, ''));
      next();
    });
    q.on('error', function (error) {
      throw error;
    });

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
      removeTrack.call(this, prev);
      // update removed
      removed++;
    }
    // maybe remove next
    if (next && next.get('linxType') === 'transition') {
      removeTrack.call(this, next);
    }
    return removed;
  },

  // add tracks to collection inorder, must have option.at
  add: function (tracks, options) {
    if (!(tracks instanceof Array)) { tracks = [tracks]; }
    if (typeof options !== 'object') { options = {}; }
    if (typeof options['at'] !== 'number') {
      options['at'] = this.length;
    }
    // add functions to queue inorder
    var q = this.q;
    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      debug("add to queue", track.get('id'), options['at'], q.length);
      q.push(function (track, options, cb) {
        processTrack.call(this, track, options, cb);
      }.bind(this, track, options));
        //_.defaults({ 'at': options['at']++ }, options)));
    }
    if (!q.running) {
      this.q.start();
    }
  },

  remove: function (tracks, options) {
    if (!(tracks instanceof Array)) { tracks = [tracks] }
    // add functions to queue inorder
    var q = this.q;
    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      debug("remove from queue", track.get('id'), q.length);
      q.push(function (track, options, cb) {
        removeTrack.call(this, track, options, cb);
      }.bind(this, track, options));
    }
    if (!q.running) {
      this.q.start();
    }
  },

  unsetTiming: function (track, index) {
    // if removing transition not from front, make sure to update prev and next
    debug("UNSETTING TIMING", track.get('id'), index)
    if (index && track.get('linxType') === 'transition') {
      this.setTiming(this.getPrev(index));
      // Note: -1 because index is of removed track
      this.setTiming(this.getNext(index - 1));
    }
    // remove timings
    track.unset(this.getTimingKey());
  },

  // sets in and out timing based on current queue
  setTiming: function (track, index) {
    if (!track) { return; }
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
    debug("SETTING TIMING", track.get('id'), timing[timingKey])
    track.set(timing);
  },

  getTiming: function (track, options) {
    var startTime, endTime;

    // if song, condition on possible transitions
    if (track.get('linxType') === 'song') {
      var prev = options['prev'];
      var next = options['next'];
      if (typeof options['index'] === 'number') {
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

  getActiveWidget: function (offset) {
    return this.getWidgets().getActiveWidget(offset);
  },

  getCurrentTime: function () {
    var widget = this.getActiveWidget();
    var player = widget && widget.get('player');
    var track = widget && widget.get('track');
    if (player && track) {
      return player.getCurrentTime();
    } else {
      return 0;
    }
  },

  // use history to go to last song if there is one,
  // or return false
  back: function () {
    if (this.history.length > 0) {
      var track = this.history.shift();
      this.add(track, { 'at': 0 });
      return track
    } else {
      return false;
    }
  },

  cycleQueue: function () {
    debug("cycleQueue");
    // shift queue
    this.trigger('cycle', this.at(0));
    var track = this.shift();
    // add played track to front of history
    track && this.history.unshift(track);
  },

  // TODO: add ability to reorder widgets to minimize load time
  // use queue to preload widgets
  isSyncing: false,
  syncWidgets: function (isContinuation) {
    // TODO: make this work
    if (this.isSyncing && !isContinuation) {
      return false;
    } else {
      this.isSyncing = true;
    }
    debug("syncWidgets called", this, isContinuation);
    var widgets = this.getWidgets();
    var activeWidget = widgets.activeWidget;

    // do the queue sync: find incorrect widget and start from there
    var wrongWidget = null;
    for (var i = 0; i < widgets.length; i++) {
      var widgetIndex = (i + activeWidget) % widgets.length;
      var queueIndex = (widgetIndex + activeWidget) % widgets.length;

      // if queue index is beyond queue, empty trailing then continue
      var widget = widgets.at(widgetIndex);
      if (queueIndex >= this.length) {
        widget.empty();
        continue;
      }

      // if incorrect track, set wrongWidget and break
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
    // otherwise, we are done syncing, so assert playstate
    } else {
      //widgets.forEach(function (widget) {
      //  widget.get('track') && widget.assertPlayState();
      //});
      this.isSyncing = false
    }

  },

});

// process one track at a time
var processTrack = function (track, options, cb) {
  if (!(options && (typeof options['at'] === 'number'))) {
    cb(new Error("queue.add not given correct options"));
  }
  debug("CALLING PROCESS TRACK", track.get('id'), options['at']);

  // if adding between transitions, remove them
  var prevTrack = this.getPrev(options['at']);
  var nextTrack = this.getNext(options['at'] - 1); // -1 b/c track not yet added
  options['at'] -= this.removeTransitions({
    'prev': prevTrack,
    'next': nextTrack,
  });

  // if adding transition, make sure it fits
  if (track.get('linxType') === 'transition') {
    addTransition.call(this, track, options, cb);
  // else, just a adding song, so go ahead
  } else {
    addTrack.call(this, track, options, false, cb);
  }
}

var addTransition = function (track, options, cb) {

  //
  // first check next
  //
  // -1 b/c transition not yet added
  var nextTrack = this.getNext(options['at'] - 1);
  if (nextTrack && nextTrack.id === track.getOutId()) {
    // id matches, so make sure timings will work
    var nextNext = this.getNext(options['at'] + 1);
    // nextNext exists, so check succeeding transition
    if (nextNext && (nextNext.get('linxType') === 'transition')) {
      var timing = this.getTiming(nextTrack, {
        'prev': track,
        'next': nextNext,
      });
      if (!timing) {
        // TODO: timing was impossible, what now?
        cb(new Error("ERROR: adding transition to queue when next is correct id but impossible timing", this, track));
      }
    }
  // incorrect nextTrack, so add
  } else {
    nextTrack = new Track({ 'id': track.getOutId() });
    this.q.unshift(addTrack.bind(this, nextTrack, options, true));
  }

  //
  // then add transition
  //
  this.q.unshift(addTrack.bind(this, track, options, false));

  //
  // then check prev
  //
  var prevTrack = this.getPrev(options['at']);
  if (prevTrack && prevTrack.id === track.getInId()) {
    // id matches, so make sure timings will work
    var prevPrev = this.getPrev(options['at'] - 1);
    // no prevPrev, so prev must be queue head
    if (!prevPrev) {
      var pos = this.getCurrentTime();
      var endIn = track.getEndIn();
      // if past transition start, not possible
      if (pos + 1 >= endIn) {
        cb(new Error("ERROR: adding transition to queue when prev is playing and past endIn", this, track));
      }
    }
    // prev is not playing, so check preceeding transition
    else if (prevPrev.get('linxType') === 'transition') {
      var timing = this.getTiming(prevTrack, {
        'prev': prevPrev,
        'next': track,
      });
      if (!timing) {
        // TODO: timing was impossible, what now?
        cb(new Error("ERROR: adding transition to queue when prev is correct id but impossible timing", this, track));
      }
    }
  // incorrect prevTrack, so add
  } else {
    prevTrack = new Track({ 'id': track.getInId() });
    this.q.unshift(addTrack.bind(this, prevTrack, options, true));
  }

  // done adding transition!
  cb()
}

var addTrack = function (track, options, needsFetch, cb) {
  debug("CALLING ADD TRACK", track.get('id'), options['at'], needsFetch);

  var doAdd = function () {
    Tracks.prototype.add.call(this, track, options);
    options['at']++;
    cb();
  }.bind(this);

  // add on fetch if needs fetch
  if (needsFetch && (process.env.NODE_ENV !== "test")) {
    track.fetch({
      'success': function (model, response, _options) {
        debug("FETCH TRACK SUCCESS", model);
        doAdd();
      },
      'error': cb,
    });
  } else {
    doAdd();
  }
};

// remove a track from queue
var removeTrack = function (track, options, cb) {
  debug("CALLING REMOVE TRACK", track.get('id'));
  // if removing song, remove corresponding transition(s)
  if (track.get('linxType') === 'song') {
    this.removeTransitions({
      'index': this.indexOf(track),
    });
  }
  Tracks.prototype.remove.call(this, track, options);
  cb && cb();
}