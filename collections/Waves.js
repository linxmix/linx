Meteor.startup(function() {
  if (Meteor.isClient) {
    WaveSurfers = {
      add: function(_id, wavesurfer) {
        this[_id] = wavesurfer;
      },
      get: function(_id) {
        return this[_id];
      },
      destroy: function(_id) {
        var wavesurfer = this[_id];
        wavesurfer && wavesurfer.destroy();
        delete this[_id];
      }
    };
  }
});

WaveModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
    track: {
      collectionName: 'tracks',
      field: 'trackId',
    },
    newTrack: {
      collectionName: 'newTracks',
      field: 'newTrackId',
    },
    linkFrom: {
      collectionName: 'links',
      field: 'linkFromId',
    },
    linkTo: {
      collectionName: 'links',
      field: 'linkToId',
    }
  },
  defaults: {
    playing: false,

    regions: {},
    analyzed: false,
    loaded: false,
    loading: false,
    loadingIntervals: [],
  },
}, {
  play: function() {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      this.set('playing', true);
      this.save();
      wavesurfer.play();
    }
  },

  pause: function() {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      this.set('playing', false);
      this.save();
      wavesurfer.pause();
    }
  },

  playpause: function() {
    if (this.get('playing')) {
      this.pause();
    } else {
      this.play();
    }
  },

  createWaveSurfer: function() {
    var wave = this;
    var wavesurfer = Object.create(WaveSurfer);

    // destroy prev
    if (this.getWaveSurfer()) {
      this.destroyWaveSurfer();
    }

    wavesurfer.on('uploadFinish', function() {
      wave.set('loading', false);
      wave.save();
    });

    wavesurfer.on('ready', function() {
      wave.set({ 'loaded': true, 'loading': false });
      wave.save();
    });

    wavesurfer.on('error', function(errorMessage) {
      wave.set('loaded', false);
      wave.save();
      window.alert("Wave Error: " + (errorMessage || 'unknown error'));
    });
  // sync with wave.getMeta('regions')
  // wave.on('region-created', wave._updateRegion.bind(wave));
  // wave.on('region-updated-end', wave._updateRegion.bind(wave));
  // wave.on('region-removed', wave._updateRegion.bind(wave));

    // add to WaveSurfers hash
    WaveSurfers.add(this.get('_id'), wavesurfer);

    return wavesurfer;
  },

  getWaveSurfer: function() {
    return WaveSurfers.get(this.get('_id'));
  },

  destroyWaveSurfer: function() {
    WaveSurfers.destroy(this.get('_id'));
  },

  loadFiles: function(files) {
    var file = files[0];
    var wavesurfer = this.getWaveSurfer();
    wavesurfer.files = files;
    wavesurfer.loadBlob(file);
    var newTrack = this.createNewTrack();
    newTrack.loadMp3Tags(file);
    this.set('newTrackId', newTrack.get('_id'));
    this.save();
  },

  loadTrack: function(track) {
    if (this.get('trackId') !== track.get('_id')) {
      var wavesurfer = this.getWaveSurfer();
      console.log("load track", track.get('title'), track.getStreamUrl());
      // set track
      this.set('trackId', track.get('_id'));
      this.save();
      // load track into wavesurfer
      wavesurfer.load(track.getStreamUrl());
    } else {
      console.log("track already loaded", track.get('title'));
    }
  },

  createNewTrack: function(attrs) {
    var newTrack = NewTracks.create(attrs || {});
    return newTrack;
  },

  loadNewTrack: function(track) {
    if (this.get('newTrackId') !== track.get('_id')) {
      var wavesurfer = this.getWaveSurfer();
      console.log("load new track", track.get('title'), track.getStreamUrl());
      // set track
      this.set('newTrackId', track.get('_id'));
      this.save();
      // load track into wavesurfer
      wavesurfer.load(track.getStreamUrl());
    } else {
      console.log("track already loaded", track.get('title'));
    }
  },

  saveNewTrack: function() {
    var newTrack = this.newTrack();
    if (newTrack) {
      var track = Tracks.create(newTrack.attributes);
      this.set({
        trackId: track.get('_id'),
        newTrackId: null,
      });
      this.save();
      newTrack.remove();
    }
  },

  hasNewTrack: function() {
    return !!this.get('newTrackId');
  },

  getTrack: function() {
    if (this.get('trackId')) {
      return this.track();
    } else {
      return this.newTrack();
    }
  },

  reset: function() {
    this.set({
      'loaded': false,
      'loading': false,
      'trackId': undefined,
      'newTrackId': undefined
    });
    this.save();
    console.log("reset", this.get('trackId'));
    this.getWaveSurfer().reset();
  }
});

Waves = Graviton.define("waves", {
  modelCls: WaveModel,
  persist: false,
  timestamps: true,
});
