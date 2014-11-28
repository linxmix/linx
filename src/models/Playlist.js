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
      'linxType': 'playlist',
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

    // if making from a soundcloud playlist, convert attrs
    if ('id' in attributes) {
      convertFromSC(attributes);
    }

    // call default constructor
    this.options = options;
    Backbone.Model.apply(this, arguments);
  },

  initialize: function () {
    var queue = new Queue([], {
      'numWidgets': this.options['numWidgets'],
      'id': this.cid,
    });
    this.set({
      'queue': queue,
    });

    // set track sort
    this.setTrackSort(this.get('trackSort'));

    // rebuffer queue on cycle
    queue.on('cycle', this.bufferQueue.bind(this));

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
    queue.on('add', updatePlayingTrack)
    queue.on('remove', updatePlayingTrack)

  },

  //
  // Collection Handling
  //

  tracks: function () {
    return this.get('tracks');
  },

  getOrAdd: function (track) {
    var haveTrack = this.tracks().get(track.id);
    if (haveTrack) {
      track = haveTrack;
    } else {
      this.add(track);
    }
    return track;
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
  
  setTrackSort: function (trackSort, options) {
    if (this.get('linxType') !== 'queue') {
      debug("setting new track sort", trackSort);
      this.set({ 'trackSort': trackSort }, options);
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

  addActiveTrack: function (track, options) {
    if (track) {
      var activeTracks = this.getActiveTracks();
      activeTracks.push(track);
      this.setActiveTracks(activeTracks, options)
    } else {
      debug("WARNING: addActiveTrack given no track!");
    }
  },

  // TODO: make sure they are in sort order
  setActiveTracks: function (tracks, options) {
    options = options ? options : {};
    if (!(tracks instanceof Array)) {
      throw new Error("setActiveTracks not given array");
    }
    // set active tracks
    var prevActiveTracks = this.getActiveTracks();
    this.set({ 'activeTracks': tracks }, options);
    // if was same as previous, manually trigger change event
    if ((tracks === prevActiveTracks) &&
      !(options.silent)) {
      this.trigger('change:activeTracks', this, tracks, options);
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
      return false;
    }
    
    // figure out if already in queue
    var queue = this.get('queue');
    var queued = queue.get(track.id);
    var index = queued && queue.indexOf(queued);
    // if already at desired pos, we're done
    if (index === pos) {
      return true;
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
    return true;
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
    var tracks = playlist.tracks();

    // make callback to give to server
    var cb = function (resp, error) {
      if (error) {
        options.error(resp || error);
      } else {
        if (method === 'create' || method === 'update') {
          convertFromSC(resp, tracks);
        }
        options.success(resp);
      }
    }

    // then determine what type of sync this is
    debug("SYNC", arguments);
    switch (method) {
      case 'read':
        Backbone.sync.apply(this, arguments); break;

      case 'create':
        var trackIds = tracks.models.map(function (track) {
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
        var trackIds = tracks.models.map(function (track) {
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
    // if track is string, assume it's an id
    if (typeof track === 'number') {
      track = this.tracks().get(track);
    }
    // if no track, play playingTrack
    if (!track && options.playingTrack) {
      track = this.get('playingTrack');
    }
    // if no playingTrack, play first activeTrack
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

// convert attributes from SC playlist to Linx playlist
function convertFromSC (attributes, tracks) {
  attributes['name'] = attributes['title'];
  if (tracks) {
    // TODO: add fetched tracks to tracks
    attributes['tracks'] = tracks;
  } else {
    attributes['tracks'] = new Tracks(attributes['tracks']);
  }
  attributes['linxType'] = 'playlist';
  return attributes;
}
