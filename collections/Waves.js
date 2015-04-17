Meteor.startup(function() {
  if (Meteor.isClient) {
    WaveSurfers = {
      set: function(_id, wavesurfer) {
        this[_id] = wavesurfer;
      },
      get: function(_id) {
        var wavesurfer = this[_id];
        if (!wavesurfer) {
          wavesurfer = Object.create(WaveSurfer);
          this.set(_id, wavesurfer);
        }
        return wavesurfer;
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
    prevWave: {
      collectionName: 'waves',
      field: 'prevWaveId'
    },
    nextWave: {
      collectionName: 'waves',
      field: 'nextWaveId'
    },
    linkFrom: {
      collectionName: 'links',
      field: 'linkFromId',
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

  init: function(template) {
    var wavesurfer = this.getWaveSurfer();

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
        wave.saveAttrs('loading', true);
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
      wave.saveAttrs('loading', false);
    });

    wavesurfer.on('ready', function() {
      template.$('.progress-bar').hide();
      wave.saveAttrs({ 'loaded': true, 'loading': false });
    });

    wavesurfer.on('reset', function() {
      template.$('.progress-bar').hide();
    });

    wavesurfer.on('error', function(errorMessage) {
      template.$('.progress-bar').hide();
      wave.saveAttrs('loaded', false);
      window.alert("Wave Error: " + (errorMessage || 'unknown error'));
    });

    wavesurfer.on('finish', function() {
      wave.onWaveEnd();
    });

    // region stuff
    // wavesurfer.on('region-created', wave._updateRegion.bind(wave));
    // wavesurfer.on('region-updated-end', wave._updateRegion.bind(wave));
    // wavesurfer.on('region-removed', wave._updateRegion.bind(wave));

    template.autorun(this.drawRegions.bind(this));
    template.autorun(this.loadTrack.bind(this));
  },

  setTrack: function(track) {
    this.track = this.track || new ReactiveVar();
    this.track.set(track);
  },

  getTrack: function() {
    this.track = this.track || new ReactiveVar();
    return this.track.get();
  },

  play: function(time) {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      this.saveAttrs('playing', true);
      wavesurfer.play(time);
    }
  },

  pause: function() {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      this.saveAttrs('playing', false);
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

  // TODO: will this break loadTrack when switching tracks?
  loadFiles: function(files) {
    // store reference to pass to uploading to s3
    this.saveAttrs('files', files);
    // load file into wavesurfer
    var file = files[0];
    var wavesurfer = this.getWaveSurfer();
    wavesurfer.loadBlob(file);

    // load mp3 tags into track
    var track = this.getTrack();
    track.loadMp3Tags(file);
  },

  // TODO: optionally load from this.get('files')?
  loadTrack: function() {
    var wavesurfer = this.getWaveSurfer();
    var track = this.getTrack();
    var streamUrl = track && track.getStreamUrl();
    if (wavesurfer && streamUrl && (streamUrl !== this.get('streamUrl'))) {
      this.saveAttrs('streamUrl', streamUrl);
      wavesurfer.load(streamUrl);
    }
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
    var data = Template.currentData();
    var links = data.links || [];
    var linkFrom = data.linkFrom;
    var linkTo = data.linkTo;
    var onWaveEnd = onWaveEnd;
    var wavesurfer = this.getWaveSurfer();

    var track = this.getTrack();

    console.log("drawing links", track && track.get('title'), links.length);
    // TODO: remove old links
    // TODO: figure out linkFrom and linkTo

    links.forEach(function(link, i) {
      var params = link.regionParams || {};
      var color;
      switch (i) {
        case 0: color = 'rgba(255, 0, 0, 1)'; break;
        case 1: color = 'rgba(0, 255, 0, 1)'; break;
        case 2: color = 'rgba(0, 0, 255, 1)'; break;
        default: color = 'rgba(255, 255, 0, 1)'; break;
      }
      params.color = color;
      console.log("drawing region", track.get('title'), params, i);

      var region = wavesurfer.links.list[params._id];
      if (!region) {
        console.log("new region", params);
        region = wavesurfer.links.add(params);
      } else {
        console.log("update region", params);
        region.update(params);
      }
    });
  },

  reset: function() {
    this.getWaveSurfer().empty();
    this.setTrack(undefined);
    this.saveAttrs({
      'loaded': false,
      'loading': false,
      'streamUrl': undefined
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

  onWaveEnd: function() {
    var nextWave = this.nextWave();
    var linkFrom = this.linkFrom();

    this.pause();
    if (nextWave) {
      nextWave.play(linkFrom && linkFrom.get('toTime'));
    }
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
    this.saveAttrs('loaded', false);
  },

  saveToBackend: function(cb) {
    var track = this.getTrack();
    var wave = this;
    var files = wave && wave.get('files');
    if (!(track && wave && files)) {
      throw new Error('Cannot upload without track, wave and files: ' + this.get('_id'));
    }
    console.log("saving to backend", track.get('title'));

    // on completion, persist track and fire finish event
    function next() {
      wave.onUploadFinish();
      track.save();
      cb && cb();
    }

    // upload to appropriate backend
    switch (track.getSource()) {
      case 's3': this._uploadToS3(next); break;
      case 'soundcloud': next(); break; // already exists on SC
      default: throw "Error: unknown track source: " + track.getSource();
    }
  },

  _uploadToS3: function(cb) {
    var track = this.getTrack();
    var wave = this;

    // autorun progress bar
    var uploadFinished = false;
    Tracker.autorun(function(computation) {
      var uploads = S3.collection.find().fetch();
      var upload = uploads[0];
      if (upload) {
        var percent = upload.percent_uploaded;
        !uploadFinished && wave.onLoading({
          type: 'upload',
          percent: percent
        });
        if (percent === 100) {
          computation.stop();
        }
      }
    });

    S3.upload({
      files: wave.get('files'),
      path: track.getS3Prefix(),
    }, function(error, result) {
      uploadFinished = true;
      if (error) { throw error; }
      // update track with new s3FileName
      var urlParts = result.relative_url.split('/');
      var s3FileName = urlParts[urlParts.length - 1];
      track.set({ s3FileName: s3FileName });
      cb && cb(error, result);
    });
  },

  setLoadingInterval: function(options) {
    var percent = 0;
    var wave = this;
    var loadingInterval = Meteor.setInterval(function() {
      wave.onLoading.call(wave, {
        percent: percent,
        type: options.type,
      });
      if (percent === 100) {
        Meteor.clearInterval(loadingInterval);
      }
      percent += 1;
    }, options.time / 100);
    // wave.loadingIntervals.push(loadingInterval);
    return loadingInterval;
  },

  analyze: function() {
    var track = this.getTrack();
    if (!track) {
      throw new Error("Cannot analyze wave without a track: " + this.get('_id'));
    } else {
      track.fetchEchonestAnalysis(this);
    }
  },

  getAnalysis: function() {
    var track = this.getTrack();
    return track && track.getAnalysis();
  }
});

Waves = Graviton.define("waves", {
  modelCls: WaveModel,
  persist: false,
  timestamps: true,
});
