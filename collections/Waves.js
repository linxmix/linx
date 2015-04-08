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

// Graviton Model to wrap WaveSurfer
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
      wavesurfer.play();
    }
  },

  pause: function() {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      this.set('playing', false);
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

  loadUrl: function(url) {
    this.getWaveSurfer().load(url);
  },

  loadFiles: function(files) {
    // store reference to pass to uploading to s3
    this.set('files', files);
    // load file into wavesurfer
    var file = files[0];
    var wavesurfer = this.getWaveSurfer();
    wavesurfer.loadBlob(file);
  },

  init: function(template) {
    var wavesurfer = this.createWaveSurfer();

    // Initialize wavesurfer
    var wave = this;
    template.$('.progress-bar').hide();

    wavesurfer.init({
      container: template.$('.wave')[0],
      waveColor: 'violet',
      progressColor: 'purple',
      cursorColor: 'white',
      minPxPerSec: 10,
      height: 150,
      fillParent: true,
      cursorWidth: 2,
      renderer: 'Canvas',
    });
    wavesurfer.initRegions();

    if (template.enableDragSelection) {
      wavesurfer.enableDragSelection({
        id: 'selected',
        color: 'rgba(255, 255, 255, 0.4)',
        loop: false,
      });
    }

    // Setup Handlers
    var lastPercent;
    wavesurfer.on('loading', function(percent, xhr, type) {
      if (!wave.get('loading')) {
        wave.set('loading', true);
      }
      template.$('.progress-bar').show();

      // update progress bar
      if (percent !== lastPercent) {
        lastPercent = percent;
        var text = {};
        switch (type) {
          case 'upload': text = { active: "Uploading...", success: "Uploaded!" }; break;
          case 'profile': text = { active: "Getting Profile...", success: "Got Profile!" }; break;
          case 'analyze': text = { active: "Analyzing...", success: "Analyzed!" }; break;
          default: text = { active: "Loading...", success: "Decoding..." };
        }
        template.$('.progress-bar').progress({
          percent: percent,
          text: text,
        });
      }
    });

    wavesurfer.on('uploadFinish', function() {
      template.$('.progress-bar').hide();
      wave.set('loading', false);
    });

    wavesurfer.on('ready', function() {
      template.$('.progress-bar').hide();
      wave.set({ 'loaded': true, 'loading': false });
    });

    wavesurfer.on('reset', function() {
      template.$('.progress-bar').hide();
    });

    wavesurfer.on('error', function(errorMessage) {
      template.$('.progress-bar').hide();
      wave.set('loaded', false);
      window.alert("Wave Error: " + (errorMessage || 'unknown error'));
    });

    // region stuff
    // wavesurfer.on('region-created', wave._updateRegion.bind(wave));
    // wavesurfer.on('region-updated-end', wave._updateRegion.bind(wave));
    // wavesurfer.on('region-removed', wave._updateRegion.bind(wave));

    template.autorun(this.drawRegions.bind(this));
  },

  newId: 0,

  setRegions: function(regions) {
    this.regions.set(regions);
  },

  getRegions: function() {
    this.regions = this.regions || new ReactiveVar([]);
    return (this.regions && this.regions.get()) || [];
  },

  clearRegions: function() {
    // clear regions
    this.regions = new ReactiveVar([]);

    // clear wave
    this.getWaveSurfer().Regions.clear();
  },

  getBufferLength: function() {
    return Graviton.getProperty(this.getWaveSurfer(), 'backend.buffer.length');
  },

  // Returns time (ms) required to upload from source server to Echonest
  getCrossloadTime: function(source) {
    var bufferLength = this.getBufferLength();
    var SC_FACTOR = 1 / 3904; // milliseconds per buffer element
    var S3_FACTOR = 1 / 1936;
    var factor = (source === 'soundcloud') ? SC_FACTOR : S3_FACTOR;
    return factor * bufferLength;
  },

  drawRegions: function() {
    var wavesurfer = this.getWaveSurfer();
    var track = this.track();
    var regions = this.getRegions();

    console.log("drawing regions", track && track.get('title'), regions.length);
    // TODO: remove old regions

    regions.forEach(function(params, i) {
      var color;
      switch (i) {
        case 0: color = 'rgba(255, 0, 0, 1)'; break;
        case 1: color = 'rgba(0, 255, 0, 1)'; break;
        case 2: color = 'rgba(0, 0, 255, 1)'; break;
        default: color = 'rgba(255, 255, 0, 1)'; break;
      }
      console.log("drawing region", track.get('title'), params, i);

      var region = wavesurfer.regions.list[params._id];
      if (!region) {
        params.color = color;
        console.log("new region", params);
        region = wavesurfer.regions.add(params);
      } else {
        console.log("update region", params);
        region.update(params);
      }
    });
  },

  onUploadFinish: function() {
    this.getWaveSurfer().fireEvent('uploadFinish');
  },

  onLoading: function(options) {
    this.getWaveSurfer().fireEvent('loading', options.percent, options.xhr, options.type);
  },

  onError: function(xhr) {
    this.getWaveSurfer().fireEvent('error', 'echonest analysis error: ' + xhr.responseText);
  },

  createWaveSurfer: function() {
    var wavesurfer = Object.create(WaveSurfer);

    // destroy prev
    if (this.getWaveSurfer()) {
      this.destroyWaveSurfer();
    }

    // add to WaveSurfers hash
    WaveSurfers.add(this.get('_id'), wavesurfer);

    return wavesurfer;
  },

  getWaveSurfer: function() {
    // console.log("getWaveSurfers", this, this.get('_id'), WaveSurfers)
    return WaveSurfers.get(this.get('_id'));
  },

  destroy: function() {
    this.destroyWaveSurfer();
    this.remove();
  },

  destroyWaveSurfer: function() {
    WaveSurfers.destroy(this.get('_id'));
  },

});

Waves = Graviton.define("waves", {
  modelCls: WaveModel,
  persist: false,
  timestamps: true,
});
