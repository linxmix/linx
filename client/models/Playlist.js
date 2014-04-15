var Backbone = require('backbone');
var debug = require('debug')('models:Playlist');

var Tracks = require('../collections/Tracks');
var Queue = require('../collections/Queue');

module.exports = Backbone.Model.extend({

  //
  // Initialization
  //

  defaults: function () {
    return {
      'name': 'playlist ' + this['cid'],
      'type': 'playlist',
      'tracks': new Tracks(),
  // TODO: turn activeTrack into array to allow for multi-selection
  //       this includes shift for region and control for individual
  //       maybe i should look this up? react keyboard
      'activeTrack': null,
    };
  },

  // dynamically determine numWidgets
  constructor: function (attributes, options) {
    var numWidgets = options && options['numWidgets'];
    if (typeof numWidgets !== 'number') {
      numWidgets = 2;
    }
    attributes['queue'] = new Queue([], {
      'numWidgets': numWidgets,
    }),
    Backbone.Model.apply(this, arguments);
  },

  initialize: function () {
    this.on('change:tracks', function (playlist, tracks) {
      playlist.setDefaultTrack();
    });
  },

  //
  // Collection Handling
  //

  tracks: function () {
    return this.get('tracks');
  },

  getHead: function () {
    return this.get('queue').models[0];
  },

  setDefaultTrack: function () {
    this.set({ 'activeTrack': this.tracks().models[0] });
  },

  add: function (track) {
    this.get('tracks').add(track);
    // if tracks was empty, reset activeTrack to default
    if (this.get('tracks').length === 1) {
      this.setDefaultTrack();
    }
  },

  remove: function (track) {
    // TODO: test this
    // if removing activeTrack, reset to default
    if (track === this.get('activeTrack')) {
      this.setDefaultTrack();
    }
    this.get('tracks').remove(track);
  },

  queue: function (track) {
    this.queueAtPos(track, this.get('queue').length);
  },

  queueAtPos: function (track, pos) {
    debug("queuing track at pos", track, pos);
    this.get('queue').add(track, { 'at': pos });
  },

  dequeue: function (track) {
    debug("dequeuing track", track);
    this.get('queue').remove(track);
  },

  // returns the widgets of this playlist's queue
  getWidgets: function () {
    return this.get('queue').getWidgets();
  },

  // returns tracks previously played from this playlist, youngest to oldest
  getHistory: function () {
    debug("getting history");
    return this.get('queue').getHistory();
  },

  bindQueueListener: function (callback) {
    this.get('queue').on('changeTrack', function (newTrack) {
      callback(newTrack);
    });
  },

  // TODO: make this actually work
  unbindQueueListener: function (callback) {
    this.get('queue').off('changeTrack', function (newTrack) {
      callback(newTrack);
    });
  },

  onTrackChange: function (callback) {
    this.get('tracks').on('add', function (track, options) {
      callback('add', track, options);
    });
    this.get('tracks').on('remove', function (track, options) {
      callback('remove', track, options);
    });
  },

  // TODO: make this actually work
  offTrackChange: function (callback) {
    this.get('tracks').off('add', function (track, options) {
      callback('add', track, options);
    });
    this.get('tracks').off('remove', function (track, options) {
      callback('remove', track, options);
    });
  },

  //
  // Mixer Functions
  //

  // TODO: play this track first, if given.
  // TODO: if track already queued, move to head
  // TODO: play even if no track given
  play: function (track) {
    this.queueAtPos(track, 0);
  },

  seek: function (percent) {
    var widget = this.get('queue').getActiveWidget();
    // jump to start of song
    widget.seek(percent);
  },

  // play last song if queue has one, or jump to back of current song
  back: function () {
    var queue = this.get('queue');
    if (!queue.back()) {
      this.seek(0);
    }
  },

  // TODO: make sure there is another song in queue before cycling
  forth: function () {
    this.get('queue').cycleQueue();
  },

});