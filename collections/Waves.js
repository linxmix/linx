// cached buffers
WaveSurferBuffers = {
  MAX_BUFFERS: 2,
  ids: [],
  buffers: [],
  add: function(id, buffer) {
    if (!id || this.get(id)) {
      return;
    }
    console.log("adding buffer");
    if (this.buffers.length >= this.MAX_BUFFERS) {
      this.remove();
    }
    this.ids.unshift(id);
    this.buffers.unshift(buffer);
  },
  remove: function() {
    console.log("removing buffer");
    this.ids = this.ids.slice(0, this.MAX_BUFFERS);
    this.buffers = this.buffers.slice(0, this.MAX_BUFFERS);
  },
  get: function(id) {
    if (!id) { return; }
    var index = this.ids.indexOf(id);
    return index > -1 ? this.buffers[index] : undefined;
  }
};

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
    regions: {},
    loaded: false,
    loadingIntervals: [],
    loading: false,
  },
}, {
  createWaveSurfer: function() {
    var wave = this;
    var wavesurfer = this.wavesurfer = Object.create(WaveSurfer);

    wavesurfer.on('uploadFinish', function() {
      wave.set('loading', false);
      wave.save();
    });

    wavesurfer.on('ready', function() {
      wave.set({ 'loaded': true, 'loading': false });
      wave.save();
      console.log("trackId", wave.get('trackId'));
      WaveSurferBuffers.add(wave.get('trackId'), wavesurfer.backend.buffer);
    });

    wavesurfer.on('reset', function() {
      wave.set({ 'loaded': false, 'loading': false, 'trackId': undefined });
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
    return wavesurfer;
  },

  loadFiles: function(files) {
    var file = files[0];
    var wavesurfer = this.getWaveSurfer();
    wavesurfer.loadBlob(file);
    var newTrack = Tracks.build();
    newTrack.loadMp3Tags(file);
    this.loadTrack(newTrack);
  },

  loadTrack: function(track) {
    var wavesurfer = this.getWaveSurfer();
    console.log("load track", track, track.getStreamUrl());
    console.log("ids", track.get('_id'), this.get('trackId'));
    if (this.get('trackId') !== track.get('_id')) {
      // set track
      this.set('trackId', track.get('_id'));
      // load audio from cache
      var cachedBuffer = WaveSurferBuffers.get(track.get('_id'));
      if (cachedBuffer) {
        console.log("CACHE HIT");
        wavesurfer.loadDecodedBuffer(cachedBuffer);
      } else {
        wavesurfer.load(track.getStreamUrl());
      }
    }
  },

  getWaveSurfer: function() {
    return this.wavesurfer;
  },
});

Waves = Graviton.define("waves", {
  modelCls: WaveModel,
  persist: false,
  timestamps: true,
});
