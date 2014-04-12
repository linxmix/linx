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

  //
  // Collection Handling
  //

  tracks: function () {
    return this.get('tracks').models;
  },

  add: function (track) {
    this.get('tracks').add(track);
  },

  remove: function (track) {
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

  unbindQueueListener: function (callback) {
    this.get('queue').off('changeTrack', function (newTrack) {
      callback(newTrack);
    });
  },

  //
  // Mixer Functions
  //

  // TODO: play this track first, if given.
  // TODO: if track already queued, move to head
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