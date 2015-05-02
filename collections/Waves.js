/* global Waves: true */
/* global WaveModel: true */
/* global WaveSurfers: true */

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

    pitchSemitones: 0,
    tempoChange: 0,
    volume: 1,
    loaded: false,
    loading: false,

    streamUrl: undefined,
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

    var params = {
      container: template.$('.wave')[0],
      waveColor: 'violet',
      progressColor: 'purple',
      cursorColor: 'white',
      minPxPerSec: 20,
      normalize: true,
      height: 128,
      fillParent: true,
      scrollParent: false,
      cursorWidth: 2,
      renderer: 'Canvas',
    };

    switch (template.data.size) {
      case 'mini':
        params.height = params.height / 4;
        params.fillParent = true;
        break;
    }

    wavesurfer.init(params);
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

    wavesurfer.on('ready', function() {
      template.$('.progress-bar.loading').hide();
      wave.saveAttrs({ 'loaded': true, 'loading': false });

      // wave.setPitch(2);
      wave.initSoundTouch();
      wave.play();
    });

    wavesurfer.on('reset', function() {
      template.$('.progress-bar').hide();
    });

    wavesurfer.on('error', function(errorMessage) {
      template.$('.progress-bar').hide();
      wave.set('loading', false);
      console.error("Wave Error: " + (errorMessage || 'unknown error'), errorMessage);
    });

    wavesurfer.on('finish', function() {
      wave.onEnd();
    });

    wavesurfer.on('region-click', function(regionWaveSurfer, e) {
      e.preventDefault();
      e.stopPropagation();

      var regionModel = Regions.findOne(regionWaveSurfer.id);
      var onClick = template.data.onRegionClick;
      regionModel && onClick && onClick(regionModel);
    });

    wavesurfer.on('region-dblclick', function(regionWaveSurfer, e) {
      e.preventDefault();
      e.stopPropagation();

      var regionModel = Regions.findOne(regionWaveSurfer.id);
      var onDblClick = template.data.onRegionDblClick;
      regionModel && onDblClick && onDblClick(regionModel);
    });

    wavesurfer.on('region-in', function(regionWaveSurfer) {
      var regionModel = Regions.findOne(regionWaveSurfer.id);

      // if region is wave's fromRegion, trigger finish
      if (regionModel && regionModel.hasLink(wave.linkFrom())) {
        wavesurfer.fireEvent('finish');
      }
    });
  },

  // add script processing node to manipulate audio on play
  initSoundTouch: function() {
    var wave = this;
    var wavesurfer = wave.getWaveSurfer();

    if (!Graviton.getProperty(wavesurfer, 'backend.ac')) {
      throw new Error('Cannot initSoundTouch for wave with no backend');
    }

    var BUFFER_SIZE = 16384;
    var NUM_CHANNELS = 1;
    var scriptNode = Graviton.getProperty(wavesurfer, 'backend.ac').createScriptProcessor(BUFFER_SIZE, NUM_CHANNELS, NUM_CHANNELS);

    var soundTouch = new SoundTouch();

    var waveBufferLength = wave.getBufferLength();
    scriptNode.onaudioprocess = function(audioEvent) {
      var inputBuffer = audioEvent.inputBuffer;
      var outputBuffer = audioEvent.outputBuffer;

      soundTouch.pitchSemitones = wave.get('pitchSemitones');
      soundTouch.tempoChange = wave.get('tempoChange');
      if (wave.get('skipST')) {
        for (var i = 0; i < inputBuffer.length; i++) {
          outputBuffer[i] = inputBuffer[i];
        }
      }
      // wavesurfer.setPlaybackRate(soundTouch.rate);
      // soundTouch.tdStretch.inputBuffer = soundTouch.inputBuffer;
      // soundTouch.tdStretch.outputBuffer = soundTouch.outputBuffer;

      // TODO: turn off when not playing (maybe connect with wavesurfer.scriptnode)
      // TODO: make work for L/R
      // TODO: turn key into number select on track
      // TODO: this will ignore other filters in the chain

      // Loop through the output channels

      var wavePercent = wavesurfer.backend.getPlayedPercents();
      var waveBufferIndex = ~~(waveBufferLength * wavePercent);
      // console.log("wave buffer", wavePercent, waveBufferIndex);

      // soundTouch.clearBuffers();
      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);

        // make sure inputData is correct length
        // TODO: what if this spills over end of wave?
        // var sampleReq = soundTouch.getSampleReq();
        // var inputData = wavesurfer.backend.buffer.getChannelData(channel).subarray(waveBufferIndex, waveBufferIndex + sampleReq * 4);

        // put into SoundTouch, process, then extract
        soundTouch.inputBuffer.putSamples(inputData);
        soundTouch.process();

        // console.log("counts", soundTouch.inputBuffer.vector.length, soundTouch._intermediateBuffer.vector.length, soundTouch.outputBuffer.vector.length);
        // soundTouch.outputBuffer.extract(outputData, 0, (BUFFER_SIZE / 2));
        soundTouch.outputBuffer.receiveSamples(outputData, BUFFER_SIZE / 2);

        // console.log("output", soundTouch.outputBuffer, outputData);
        // console.log("input", soundTouch.inputBuffer, inputData);
      }
    };

    // wavesurfer.backend.setFilter(scriptNode);
  },

  
  setPitch: function(semitones) {
    var wavesurfer = this.getWaveSurfer();
    var buffer = Graviton.getProperty(wavesurfer, 'backend.buffer');

    if (!buffer) {
      throw new Error('Cannot setPitch for wave with no buffer');
    }

    var soundTouch = new SoundTouch();
    soundTouch.pitchSemitones = semitones;

    // for each channel, copy to SoundTouch, shift, then update buffer
    for (var channel = 0; channel < buffer.numberOfChannels; channel++) {
      var bufferData = buffer.getChannelData(channel);
      soundTouch.clearBuffers();
      soundTouch.inputBuffer.putSamples(bufferData);
      soundTouch.process();

      var outputData = soundTouch.outputBuffer.vector;

      for (var sample = 0; sample < outputData.length; sample++) {
        bufferData[sample] = outputData[sample];
      }
    }
  },

  setTrack: function(track) {
    if (track && track.get('_id') !== this.get('trackId')) {
      this.saveAttrs('trackId', track && track.get('_id'));
    }
  },

  getTrack: function() {
    return this.track();
  },

  assertVolume: function() {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer) {
      var track = this.getTrack();
      var trackVolume = track && track.get('volume');

      // multiple by track volume, if exists
      var volume = this.get('volume');
      if (trackVolume) { volume *= trackVolume; }

      wavesurfer.setVolume(volume);
    }
  },

  playLinkFrom: function() {
    var linkFrom = this.linkFrom();
    if (linkFrom) {
      this.play(linkFrom.get('fromTime') - 5);
    }
  },

  play: function(time) {
    var wavesurfer = this.getWaveSurfer();
    if (wavesurfer && this.get('loaded')) {
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
      var streamUrl = track.getStreamUrl();
      if (streamUrl && (streamUrl !== this.get('streamUrl'))) {
        this.saveAttrs('streamUrl', streamUrl);
        wavesurfer.load(streamUrl);
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
    var wavesurfer = this.getWaveSurfer();
    return wavesurfer && wavesurfer.regions.list['drag-selection'];
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
      'streamUrl': undefined,
      'linkFromId': undefined,
      'linkToId': undefined,
      'playing': false,
    });
  },

  onError: function(error) {
    this.getWaveSurfer().fireEvent('error', error);
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
  },

  getSampleRegion: function(start, end, sampleSize) {
    var wavesurfer = this.getWaveSurfer();
    var wave = this;
    sampleSize = sampleSize || 50;

    // first compute start and end samples
    var startSample = start || 0, endSample = end || wave.getBufferLength();
    console.log("get sample region", startSample, endSample);

    var buffer = Graviton.getProperty(wavesurfer, 'backend.buffer');
    var chan = buffer.getChannelData(0);
    var length = Math.floor((endSample - startSample) / sampleSize);
    var samples = new Float32Array(length);

    // compute new samples in region
    for (var i = 0; i < length; i++) {
      var start = startSample + ~~(i * sampleSize);
      var end = start + sampleSize;
      var avg = 0;
      // compute average in current sample
      for (var j = start; j < end; j++) {
        var value = chan[j];
        avg += Math.abs(value);
      }
      avg /= sampleSize;
      samples[i] = avg;
    }
    return samples;
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
