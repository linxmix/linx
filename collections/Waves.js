Meteor.startup(function() {
  if (Meteor.isClient) {
    WaveSurfers = {
      create: function(_id) {
        this[_id] = Object.create(WaveSurfer);
        return this.get(_id);
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
    },
    linkTo: {
      collectionName: 'links',
      field: 'linkToId',
    },
    track: {
      collectionName: 'tracks',
      field: 'trackId',
    }
  },
  hasMany: {
    regions: {
      collectionName: 'regions',
      foreignKey: 'waveId',
    }
  },
  defaults: {
    playing: false,

    loaded: false,
    loading: false,
    loadingIntervals: [],
  },
}, {
  createWaveSurfer: function() {
    return WaveSurfers.create(this.get('_id'));
  },

  init: function(template) {
    console.log("wave init");
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

    if (template.data.enableDragSelection) {
      wavesurfer.enableDragSelection({
        id: 'drag-selection',
        color: 'rgba(255, 255, 255, 0.4)',
        loop: false,
      });
    }

    // Setup Handlers
    var lastPercentLoading;
    wavesurfer.on('loading', function(percent, xhr, type) {
      if (!wave.get('loading')) {
        wave.saveAttrs('loading', true);
      }
      if (wave.get('loaded')) {
        wave.saveAttrs('loaded', false);
      }
      template.$('.progress-bar.loading').show();

      // update progress bar
      if (percent !== lastPercentLoading) {
        lastPercentLoading = percent;
        template.$('.progress-bar.loading').progress({
          percent: percent,
          text: {
            active: "Loading...",
            success: "Decoding..."
          },
        });
      }
    });

    var lastPercentUploading;
    wavesurfer.on('uploading', function(percent, xhr, type) {
      if (!wave.get('uploading')) {
        wave.saveAttrs('uploading', true);
      }
      template.$('.progress-bar.uploading').show();

      // update progress bar
      if (percent !== lastPercentUploading) {
        lastPercentUploading = percent;
        var text = {};
        switch (type) {
          case 'upload': text = { active: "Uploading...", success: "Uploaded!" }; break;
          case 'profile': text = { active: "Getting Profile...", success: "Got Profile!" }; break;
          case 'analyze': text = { active: "Analyzing...", success: "Analyzed!" }; break;
          default: text = { active: "Loading...", success: "Decoding..." };
        }
        template.$('.progress-bar.uploading').progress({
          percent: percent,
          text: text,
        });
      }
    });

    wavesurfer.on('uploadFinish', function() {
      template.$('.progress-bar.uploading').hide();
      wave.saveAttrs('uploading', false);
    });

    wavesurfer.on('ready', function() {
      template.$('.progress-bar.loading').hide();
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
      wave.onEnd();
    });

    wavesurfer.on('region-click', function(regionWaveSurfer, e) {
      e.preventDefault();
      e.stopPropagation();

      var regionModel = Regions.findOne(regionWaveSurfer.id);
      var onClick = template.data.onRegionClick;
      onClick && onClick(regionModel);
    });

    wavesurfer.on('region-dblclick', function(regionWaveSurfer, e) {
      e.preventDefault();
      e.stopPropagation();

      var regionModel = Regions.findOne(regionWaveSurfer.id);
      var onDblClick = template.data.onRegionDblClick;
      onDblClick && onDblClick(regionModel);
    });

    wavesurfer.on('region-in', function(regionWaveSurfer) {
      var regionModel = Regions.findOne(regionWaveSurfer.id);

      // if region is wave's fromRegion, trigger finish

      wave.refresh();
      console.log("region in", wave.getTrack().get('title'), wave.linkFrom(), wave.get('linkFromId'));
      if (regionModel.hasLink(wave.linkFrom())) {
        wavesurfer.fireEvent('finish');
      }
    });
  },

  setTrack: function(track) {
    if (track && track.get('_id') !== this.get('trackId')) {
      this.saveAttrs('trackId', track && track.get('_id'));
    }
  },

  getTrack: function() {
    return this.track();
  },

  playLinkFrom: function() {
    var linkFrom = this.linkFrom();
    if (linkFrom) {
      this.play(linkFrom.get('fromTime') - 5);
    }
  },

  play: function(time) {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      var prev = Waves.findOne(Session.get('playingWave'));
      if (prev) {
        prev.pause();
      }

      Session.set('playingWave', this.get('_id'));
      wavesurfer.play(time);
      this.saveAttrs('playing', true);
    }
  },

  pause: function() {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      wavesurfer.pause();
      this.saveAttrs('playing', false);
    }
  },

  playpause: function() {
    if (this.get('playing')) {
      this.pause();
    } else {
      this.play();
    }
  },

  loadAudio: function() {
    var wavesurfer = this.getWaveSurfer();
    var track = this.getTrack();

    if (track && wavesurfer) {

      // try first to load from file
      var audioFile = track.getAudioFile();
      if (audioFile) {
        var fileName = audioFile.name;
        console.log("loadAudio", fileName, this.get('fileName'));
        if (fileName && (fileName !== this.get('fileName'))) {
          this.saveAttrs('fileName', fileName);
          wavesurfer.loadBlob(audioFile);
        }
      }

      // else, load from url
      else {
        var streamUrl = track.getStreamUrl();
        if (streamUrl && (streamUrl !== this.get('streamUrl'))) {
          this.saveAttrs('streamUrl', streamUrl);
          wavesurfer.load(streamUrl);
        }
      }

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

  findRegionLink: function(link) {
    return _.find(this.regions.all(), function(region) {
      return region.hasLink(link);
    });
  },

  getDragSelection: function() {
    return this.getWaveSurfer().regions.list['drag-selection'];
  },

  assertRegion: function(link, params) {
    if (!this.findRegionLink(link)) {
      this.regions.add(params);
    }
  },

  setNextWave: function(wave) {
    this.saveAttrs('nextWaveId', wave.get('_id'));
  },

  setPrevWave: function(wave) {
    this.saveAttrs('prevWaveId', wave.get('_id'));
  },

  setLinkFrom: function(link) {
    this.assertRegion(link, {
      linkId: link.get('_id'),
      start: link.get('fromTime'),
    });

    this.saveAttrs('linkFromId', link.get('_id'));
  },

  setLinkTo: function(link) {
    this.assertRegion(link, {
      linkId: link.get('_id'),
      start: link.get('toTime'),
    });

    this.saveAttrs('linkToId', link.get('_id'));
  },

  drawRegions: function() {
    var regions = this.regions.all() || [];

    regions.forEach(function(regionModel) {
      regionModel.draw();
    });
  },

  destroyRegions: function() {
    (this.regions.all() || []).forEach(function(region) {
      region.destoy();
    });
  },

  reset: function() {
    this.getWaveSurfer().empty();
    this.setTrack(undefined);
    this.saveAttrs({
      'loaded': false,
      'loading': false,
      'uploading': false,
      'streamUrl': undefined,
      'fileName': undefined,
      'linkFromId': undefined,
      'linkToId': undefined,
    });
  },

  onUploadFinish: function() {
    this.getWaveSurfer().fireEvent('uploadFinish');
  },

  onUploading: function(options) {
    this.getWaveSurfer().fireEvent('uploading', options.percent, options.xhr, options.type);
  },

  onError: function(xhr) {
    this.getWaveSurfer().fireEvent('error', 'echonest analysis error: ' + xhr.responseText);
  },

  onEnd: function() {
    var nextWave = this.nextWave();
    var linkFrom = this.linkFrom();
    // console.log("wave end", linkFrom, this, this.nextWave());

    if (this.get('playing')) {
      this.pause();
      console.log("on end", this.getTrack().get('title'), nextWave);
      if (nextWave) {
        nextWave.play(linkFrom && linkFrom.get('toTime'));
      }
    }
  },

  getWaveSurfer: function() {
    // console.log("getWaveSurfers", this, this.get('_id'), WaveSurfers)
    return WaveSurfers.get(this.get('_id'));
  },

  destroy: function() {
    this.destroyRegions();
    this.destroyWaveSurfer();
    this.remove();
  },

  destroyWaveSurfer: function() {
    this.reset();
    WaveSurfers.destroy(this.get('_id'));
  },

  saveToBackend: function(cb) {
    var track = this.getTrack();
    var wave = this;
    var files = track && track.getAudioFile();
    if (!(track && wave && files)) {
      throw new Error('Cannot upload without track, wave and files: ' + this.get('_id'));
    }
    console.log("saving to backend", track.get('title'));

    // on completion, persist track and fire finish event
    function next() {
      wave.onUploadFinish();
      track.store();
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
        !uploadFinished && wave.onUploading({
          type: 'upload',
          percent: percent
        });
        if (percent === 100) {
          computation.stop();
        }
      }
    });

    S3.upload({
      files: track.getAudioFiles(),
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
      wave.onUploading.call(wave, {
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
  },

  compareTo: function(toWave) {
    var fromWave = this;
    var fromAnalysis = fromWave.getAnalysis();
    var toAnalysis = toWave.getAnalysis();

    if (!(fromWave && fromAnalysis && toWave && toAnalysis)) {
      console.log("fromWave", fromWave, "fromAnalysis", fromAnalysis, "toWave", toWave, "toAnalysis", toAnalysis);
      throw new Error("Cannot compare without waves and analyses");
    }

    var matches = compareSegs(getSegs(fromWave, fromAnalysis), getSegs(toWave, toAnalysis));
    var bestMatches = _.sortBy(matches, 'dist');
    console.log("best matches", bestMatches);

    return bestMatches;
  }
});

Waves = Graviton.define("waves", {
  modelCls: WaveModel,
  persist: false,
  timestamps: true,
});

function getSegs(wave, analysis) {
  var segments = analysis.segments;
  var selectedRegion = wave.getDragSelection();
  return _.filter(segments, function (seg) {
    var THRESH = 0.5;
    var isWithinConfidence = (seg.confidence >= THRESH);
    var isWithinRegion = !selectedRegion || (seg.start >= selectedRegion.start) &&
      (seg.start <= selectedRegion.end);
    return isWithinRegion && isWithinConfidence;
  });
}

function compareSegs(segs1, segs2) {
  var matches = [];
  segs1.forEach(function (seg1) {
    segs2.forEach(function (seg2) {
      // compute distance between segs
      matches.push({
        'seg1': seg1.start,
        'seg2': seg2.start,
        'dist': euclidean_distance(seg1.timbre, seg2.timbre),
      });
    });
  });
  return matches;
}

// expects v1 and v2 to be the same length and composition
function euclidean_distance(v1, v2) {
  //debug("computing distance", v1, v2);
  var sum = 0;
  for (var i = 0; i < v1.length; i++) {
    // recursive for nested arrays
    //if (v1[i] instanceof Array) {
    //  sum += euclidean_distance(v1[i], v2[i]);
    //} else {
      var delta = v2[i] - v1[i];
      sum += delta * delta;
    //}
    //debug("running total", sum);
  }
  return Math.sqrt(sum);
}
