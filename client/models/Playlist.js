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
      'playState': 'stop',
      'tracks': new Tracks(),
    };
  },

  // dynamically determine numWidgets
  constructor: function (attributes, options) {
    var numWidgets = attributes['numWidgets'];
    if (typeof numWidgets !== 'number') {
      numWidgets = 1;
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
    if (this.get('type') === 'queue') {
      this.queue(track);
    } else {
      this.get('tracks').add(track);
    }
  },

  remove: function (track) {
    if (this.get('type') === 'queue') {
      this.dequeue(track);
    } else {
      this.get('tracks').remove(track);
    }
  },

  queue: function (track) {
    this.queueAtPos(track, this.get('queue').length);
  },

  queueAtPos: function (track, pos) {
    debug("queuing track at pos", track, pos);
    track.set({ 'queueIndex': pos });
    this.get('queue').add(track);
  },

  // TODO: figure this out
  dequeue: function (track) {
    debug("dequeuing track", track);
    this.get('queue').remove(track);
  },

  // returns the widgets of this playlist's queue
  getWidgets: function () {
    debug("getting widgets");
    return this.get('queue').getWidgets();
  },

  // returns tracks previously played from this playlist, youngest to oldest
  getHistory: function () {
    debug("getting history");
    return this.get('queue').getHistory();
  },

  //
  // Mixer Functions
  //

  assertPlayState: function (playState) {
    // first sync this playlist's playState with given playState
    if (playState) {
      this.set('playState', playState);
    } else {
      playState = this.get('playState')
    }
    switch (playState) {
      case 'play': this.play(); break;
      case 'pause': this.pause(); break;
      case 'stop': this.stop(); break;
    }
  },

  // TODO: make sure there is a song in queue before playing
  play: function () {
    this.get('queue').getActiveWidget().play()
  },

  pause: function () {
    this.get('queue').getActiveWidget().pause()
  },

  stop: function () {
    this.get('queue').getActiveWidget().stop()
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