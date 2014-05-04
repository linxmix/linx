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
      'trackSort': { 'key': 'title', 'direction': 1 },
    };
  },

  constructor: function (attributes, options) {
    attributes = attributes ? attributes : {};
    options = options ? options : {};
    
    // numWidgets must a positive integer
    options['numWidgets'] = options['numWidgets'] || 2;

    // if making from a soundcloud playlist, fill args
    if (attributes['kind'] === 'playlist') {
      attributes['name'] = attributes['title'];
      attributes['tracks'] = new Tracks(attributes['tracks']);
      attributes['type'] = 'playlist';
    }

    // call default constructor
    this.options = options;
    Backbone.Model.apply(this, arguments);
  },

  initialize: function () {
    this.set({
      'queue': new Queue([], {
          'numWidgets': this.options['numWidgets'],
          'id': this.cid,
        }),
    });

    // set track sort
    this.setTrackSort(this.get('trackSort'));

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
        this.set({ 'playingTrack': queue.at(0) })
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

  getSongs: function () {
    return this.get('queue').getSongs();
  },

  getTransitions: function () {
    return this.get('queue').getTransitions();
  },

  // returns tracks previously played from this playlist, youngest to oldest
  history: function () {
    return this.get('queue').history;
  },
  
  setTrackSort: function (trackSort) {
    if (this.get('type') !== 'queue') {
      debug("setting new track sort", trackSort);
      this.set({ 'trackSort': trackSort });
      var tracks = this.tracks();
      // change sort attribute then sort
      var key = trackSort.key;
      if (key === 'play_status') {
        var history = this.history();
        var playing = this.get('playingTrack');
        tracks.comparator = sortByHistory.bind(this,
          this.get('playingTrack'), history, history.length);
      } else {
        tracks.comparator = key;
      }
      tracks.sort();
      // reverse if direction is backwards
      if (trackSort.direction === -1) {
        tracks.models.reverse();
      }
      // rebuffer queue since now our order changed
      this.bufferQueue();
    }
  },

  // get activeTracks or default track if something is wanted
  getActiveTracks: function (getSomething) {
    var activeTracks = this.get('activeTracks');
    if (getSomething && _.isEmpty(activeTracks)) {
      activeTracks = [this.tracks().models[0]];
    }
    return activeTracks;
  },

  getQueueIndex: function (track) {
    return this.get('queue').indexOf(track);
  },

  add: function (tracks, options) {
    options = options ? options : {};
    options['sort'] = false;
    this.tracks().add(tracks, options);
  },

  remove: function (tracks, options) {

    // if bool, remove activeTracks
    var activeTracks;
    if (options.activeTracks) {
      activeTracks = [];
      tracks = this.getActiveTracks();
    // otherwise remove any tracks from activeTracks
    } else {
      if (!(tracks instanceof Array)) {
        tracks = [tracks];
      }
      // TODO: test this
      // if any of tracks are activeTracks, remove from activeTracks
      activeTracks = this.getActiveTracks();
      activeTracks = _.filter(activeTracks, function(activeTrack) {
        return (tracks.indexOf(activeTrack) === -1);
      });
    }

    // TODO: test this
    // remove any tracks from queue
    var queue = this.get('queue');
    queue.remove(_.filter(queue, function(track) {
      return (tracks.indexOf(track) > -1);
    }), options);

    // now do the actual removals
    debug("removing tracks", tracks);
    this.tracks().remove(tracks, options);
    this.set({ 'activeTracks': activeTracks });
  },  

  queue: function (track) {
    this.queueAtPos(track, this.get('queue').length);
  },

  queueAtPos: function (track, pos) {
    if (!track || !track.get('stream_url')) {
      throw new Error("cannot queueAtPos track", track);
    }
    if (typeof pos !== 'number') {
      throw new Error("cannot queueAtPos with no pos", pos);
    }
    // do not queue tracks >= 30min b/c it will break the app
    // TODO: make it so we can stream instead of DL so this works
    if (track.get('duration') >= 1800000) {
      alert("We're sorry, but right now SoundCloud won't let us stream tracks that are 30min or longer!");
      return;
    }
    
    // figure out if already in queue
    var queue = this.get('queue');
    var queued = queue.get(track.id);
    var index = queued && queue.indexOf(queued);
    // if already at desired pos, we're done
    if (index === pos) {
      return;
    // if queued in wrong spot, first silently remove
    } else if (queued) {
      if (index < pos) { 
        pos--; // remember to decrement if removed from in front of pos
      }
      queue.remove(queued, {
        'silent': true,
      });
    }
    // add track at pos
    debug("queuing track at pos", track, pos);
    queue.add(track, { 'at': pos });
  },

  dequeue: function (track) {
    debug("dequeuing track", track);
    this.get('queue').remove(track);
  },

  // returns the widgets of this playlist's queue
  getWidgets: function () {
    return this.get('queue').getWidgets();
  },

  getTimingKey: function () {
    return this.get('queue').getTimingKey();
  },

  onCycle: function (callback) {
    this.get('queue').on('cycle', callback);
  },

  offCycle: function (callback) {
    this.get('queue').off('cycle', callback);
  },

  getDefaultEvents: function () {
    return [
      'add', 'remove', 'change:playingTrack',
      'change:activeTrack', 'change:trackSort',
    ];
  },

  onEvents: function (callback, events) {
    events = events || this.getDefaultEvents();
    var tracks = this.tracks();
    events.forEach(function (event) {
      tracks.on(event, callback);
    });
  },

  offEvents: function (callback, events) {
    events = events || this.getDefaultEvents();
    var tracks = this.tracks();
    events.forEach(function (event) {
      tracks.off(event, callback);
    });
  },

  // TODO: make this always play in order of tracks
  bufferQueue: function () {
    debug("buffering queue", this.tracks());
    var queue = this.get('queue');
    var tracks = this.tracks();

    // TODO: if queue is already of length 2 or greater,
    //       remove buffer songs that are not after nextSong
    if (queue.length >= 2) {
      queue.remove(queue.slice(1, queue.length), {
        'silent': true,
      });
      queue = this.get('queue');
    }

    // if queue has a song, buffer the next
    if (queue.length === 1) {
      var currTrack = tracks.get(queue.models[0]);
      var nextTrack = tracks.at(tracks.indexOf(currTrack) + 1);
      nextTrack && this.queue(nextTrack);
    }

    // if queue has no songs, raise question mark
    else if (queue.length === 0) {
      debug("trying to buffer empty queue");
    }
  },

  // TODO: convert from sdk to urls
  // TODO: find out what other params SC lets us create/update
  sync: function (method, playlist, options) {

    // first make sure we have something to sync
    var changed = playlist.changedAttributes();
    // if playlist is new or method is delete, we are good
    if (!(playlist.isNew() || method === 'delete')) {
      // we are also good if we changed something important
      if (changed) {
        if (!(changed['tracks'] || changed['name'])) {
          debug("playlist not new but nothing important changed", playlist.get('name'));
          return;
        }
      } else {
        debug("playlist not new and wasn't changed", playlist.get('name'));
        return;
      }
    }

    // make callback to give to server
    var cb = function (resp, error) {
      if (error) {
        options.error(playlist, resp || error, options);
      } else {
        playlist && playlist.set({ 'onSC': true });
        // TODO: call this but make it not change our playlists
        //options.success(playlist, resp, options);
      }
    }

    // then determine what type of sync this is
    debug("SYNC", arguments);
    switch (method) {
      case 'read':
        Backbone.sync.apply(this, arguments); break;

      case 'create':
      // TODO: does _.pluck work here?
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
      // TODO: does _.pluck work here?
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

  play: function (options) {
    var defaultOptions = {
      'track': null,
      'playingTrack': true,
      'activeTracks': true,
    }
    if (typeof options !== 'object') {
      options = {};
    }
    _.defaults(options, defaultOptions);
    debug("play", options, this.get('playingTrack'), this.getActiveTracks(true)[0]);
    var queue = this.get('queue');
    var track = options.track;
    if (!track && options.playingTrack) {
      track = this.get('playingTrack');
    }
    if (!track && options.activeTracks) {
      track = this.getActiveTracks(true)[0];
    }
    this.queueAtPos(track, 0);
    this.bufferQueue();
  },

  seek: function (percent) {
    var widget = this.get('queue').getActiveWidget();
    // jump to start of song
    widget.seek(percent);
  },

  // play last song, or play song above, or jump to back of current song
  back: function () {
    var queue = this.get('queue');
    if (!queue.back()) {
      var playing = this.get('playingTrack');
      var tracks = this.tracks();
      var index = playing && tracks.indexOf(playing);
      debug("BACK", playing, index);
      if (index && index > 0) {
        this.queueAtPos(tracks.at(index - 1), 0);
      } else {
        this.seek(0);
      }
    }
  },

  forth: function () {
    this.get('queue').cycleQueue();
  },

});

// sort by play history, first played first
function sortByHistory (playing, history, length, track) {
  var index = history.indexOf(track);
  if (index > -1) {
    return -index;
  } else if (track.id === (playing && playing.id)) {
    return 1;
  } else {
    return 2;
  }
}