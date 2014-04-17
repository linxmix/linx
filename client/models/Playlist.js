var Backbone = require('backbone');
var debug = require('debug')('models:Playlist');

var Tracks = require('../collections/Tracks');
var Queue = require('../collections/Queue');

var _ = require('underscore');

module.exports = Backbone.Model.extend({

  //
  // Initialization
  //

  // TODO: remove name collisions with soundcloud?
  defaults: function () {
    return {
      'name': 'playlist ' + this['cid'],
      'type': 'playlist',
      'tracks': new Tracks(),
      'activeTracks': [],
      'playingTrack': null,
    };
  },

  constructor: function (attributes, options) {
    attributes = attributes ? attributes : {};
    options = options ? options : {};

    // if making from a soundcloud playlist, fill args
    if (attributes['kind'] === 'playlist') {
      attributes['name'] = attributes['title'];
      attributes['tracks'] = new Tracks(attributes['tracks']);
      attributes['type'] = 'playlist';
    }

    // dynamically determine numWidgets
    var numWidgets = options['numWidgets'];
    if (typeof numWidgets !== 'number') {
      numWidgets = 1;
    }
    attributes['queue'] = new Queue([], {
      'numWidgets': numWidgets,
    }),

    // continue regular constructor
    Backbone.Model.apply(this, arguments);
  },

  initialize: function () {

    // if new tracks collection, set activeTracks to default
    this.setDefaultTracks();
    this.on('change:tracks', function (playlist, tracks) {
      console.log("CHANGED TRACKS", tracks);
      playlist.setDefaultTracks();
    }.bind(this));

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

  setDefaultTracks: function () {
    this.set({ 'activeTracks': [this.tracks().models[0]] });
  },

  add: function (track) {
    this.tracks().add(track);
    // if tracks was empty, reset activeTracks to default
    if (this.tracks().length === 1) {
      this.setDefaultTracks();
    }
  },

  remove: function (track) {
    // TODO: test this
    // if removing an activeTrack, remove from activeTracks
    var activeTracks = this.get('activeTracks');
    var index = activeTracks.indexOf(track);
    if (index > -1) {
      this.set({
        'activeTracks': activeTracks.splice(index, 1),
      });
    }
    // if no more activeTracks, reset to default
    if (this.get('activeTracks').length === 0) {
      this.setDefaultTracks();
    }
    // now remove track from playlist
    this.tracks().remove(track);
  },

  queue: function (track) {
    this.queueAtPos(track, this.get('queue').length);
  },

  queueAtPos: function (track, pos) {
    if (!track || !track.get('stream_url')) {
      return debug("ERROR: cannot queueAtPos track", track);
    }
    debug("queuing track at pos", track, pos);
    var queue = this.get('queue');
    // if already queued, silently remove first
    if (queue.get(track.id)) {
      queue.remove(track.id, {
        'silent': true,
      });
    // add track at pos
    }
    queue.add(track, {
      'at': pos,
    });
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

  // TODO: make this prioritize current track
  bufferQueue: function () {
    debug("buffering queue", this.tracks());
    var queue = this.get('queue');
    var tracks = this.tracks();

    // TODO: if queue is already of length 2 or greater,
    //       remove buffer songs that are not after nextSong
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

  // TODO: convert from sdk to urls
  // TODO: find out what other params SC lets us create/update
  sync: function (method, playlist, options) {
    var cb = function (resp, error) {
      if (error) {
        options.error(playlist, resp || error, options);
      } else {
        // TODO: call this but make it not change our playlists
        //options.success(playlist, resp, options);
      }
    }

    // first make sure we have something to sync
    var changed = playlist.changedAttributes();
    console.log("CHANGED", changed);
    if (!changed) { return; }
    else if (!(changed['tracks'] || changed['name'])) { return; }

    // then determine what type of sync this is
    debug("SYNC", arguments);
    switch (method) {
      case 'read':
        Backbone.sync.apply(this, arguments); break;

      case 'create':
        var trackIds = playlist.tracks().models.map(function (track) {
          return { 'id': track.id }
        });
        SC.post('/playlists', {
          'playlist': {
            'title': playlist.get('name'),
            'tracks': trackIds,
          }
        }, cb);
        break;

      case 'update':
        var trackIds = playlist.tracks().models.map(function (track) {
          return { 'id': track.id }
        });
        SC.put(playlist.get('uri'), {
          'playlist': {
            'title': playlist.get('name'),
            'tracks': trackIds,
          }
        }, cb);
        break;

      case 'delete':
        SC.delete(playlist.get('uri'), cb);
        break;

    } // /end switch
  },

  //
  // Mixer Functions
  //

  play: function (track) {
    var queue = this.get('queue');
    if (!track) { track = this.get('activeTracks')[0]; }
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