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
      'playingTrack': null,
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

    // if new tracks collection, set activeTrack to default
    this.on('change:tracks', function (playlist, tracks) {
      playlist.setDefaultTrack();
    });

    // rebuffer queue on cycle
    this.onCycle(function (newTrack) {
      this.bufferQueue();
    }.bind(this));

    // update playingTrack on queue change
    var updatePlayingTrack = function () {
      var playingTrack = this.get('playingTrack');
      var queue = this.get('queue');
      if (queue.length === 0) {
        this.set({ 'playingTrack': null });
      } else {
        var queueHead = this.get('queue').models[0];
        if (queueHead && !playingTrack) {
          this.set({ 'playingTrack': queueHead })
        } else if (queueHead &&
          (playingTrack.cid !== queueHead.cid)) {
          this.set({ 'playingTrack': queueHead, });
        }
      }
    }.bind(this);
    this.get('queue').on('add', updatePlayingTrack);
    this.get('queue').on('remove', updatePlayingTrack);

  },

  //
  // Collection Handling
  //

  tracks: function () {
    return this.get('tracks');
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

  onCycle: function (callback) {
    this.get('queue').on('cycle', callback);
  },

  offCycle: function (callback) {
    this.get('queue').off('cycle', callback);
  },

  onChange: function (callback) {
    this.tracks().on('add', callback);
    this.tracks().on('remove', callback);
    this.on('change:playingTrack', callback);
  },

  offChange: function (callback) {
    this.tracks().off('add', callback);
    this.tracks().off('remove', callback);
    this.off('change:playingTrack', callback);
  },

  bufferQueue: function () {
    debug("buffering queue", this.tracks());
    var queue = this.get('queue');
    var tracks = this.tracks();
    // if queue is already of length 2, pass
    if (queue.length >= 2) {
      return;

    // if queue has a song, buffer the next
    } else if (queue.length === 1) {
      var currTrack = tracks.get(queue.models[0]);
      var nextTrack = tracks.at(tracks.indexOf(currTrack) + 1);
      this.queue(nextTrack);
    }

    // if queue has no songs, raise question mark
    else if (queue.length === 0) {
      debug("trying to buffer empty queue");
    }
  },

  //
  // Mixer Functions
  //

  // TODO: play this track first, if given.
  // TODO: if track already queued, move to head
  // TODO: play even if no track given
  play: function (track) {
    var queue = this.get('queue');
    if (!track) { track = this.get('activeTrack'); }
    if (!track) { debug("WARNING: no track for playlist to play"); }
    this.queueAtPos(track, 0);
    this.bufferQueue();
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