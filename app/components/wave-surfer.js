import Ember from 'ember';
import Progress from 'linx/lib/progress';
import Wavesurfer from 'linx/lib/wavesurfer';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

export default Ember.Component.extend({
  classNames: ['WaveSurfer'],

  // expected one of these two params
  file: null,
  streamUrl: null,

  // TODO: create wavesurfer region, update when start/end change?
  start: 0,
  end: null,
  
  // optional params
  isPlaying: false,
  seekTime: 0,
  waveParams: null,
  beats: null, // array of floats (seconds)
  bars: null, // array of floats (seconds)

  // params
  clock: null, // injected by app
  wave: Ember.computed(function() {
    return Wave.create({ component: this });
  }),

  onWaveLoad: function() {
    if (this.get('wave.isLoaded')) {
      this.sendAction('didLoadWave');
    }
  }.observes('wave.isLoaded').on('init'),

  drawBeats: function() {
    var beats = this.get('beats');
    var wave = this.get('wave');

    if (wave && beats) {
      beats.forEach(function(beat) {
        wave.createRegion({
          start: beat,
          color: 'green',
          className: 'beat-region',
        });
      });
    }
  }.observes('beats.[]', 'wave'),

  drawBars: function() {
    var bars = this.get('bars');
    var wave = this.get('wave');

    if (wave && bars) {
      bars.forEach(function(beat) {
        wave.createRegion({
          start: beat,
          color: 'red',
          className: 'bar-region',
        });
      });
    }
  }.observes('bars.[]', 'wave'),

  initWave: function() {
    var wave = this.get('wave');

    var params = {
      container: this.$('.WaveSurfer-wave')[0],
      audioContext: this.get('clock.context')
    };

    wave.initWavesurfer(params);
  }.on('didInsertElement'),

  destroyWave: function() {
    var wave = this.get('wave');
    wave && wave.destroy();
  }.on('willDestroyElement'),
});

// Wraps Wavesurfer
export const Wave = Ember.Object.extend({

  // expected params
  component: null,

  // params
  wavesurfer: null,
  file: Ember.computed.alias('component.file'),
  streamUrl: Ember.computed.alias('component.streamUrl'),
  isLoading: Ember.computed.alias('progress.isLoading'),
  isLoaded: false,
  defaultParams: Ember.computed(function() {
    return {
      waveColor: 'violet',
      progressColor: 'purple',
      cursorColor: 'white',
      minPxPerSec: 20,
      normalize: true,
      height: 128,
      fillParent: false,
      scrollParent: true,
      cursorWidth: 2,
      renderer: 'Canvas',
    };
  }),
  regions: Ember.computed(function() { return []; }),
  
  progress: Ember.computed(function() { return Progress.create(); }),

  playStateDidChange: function() {
    Ember.run.once(this, 'updatePlayState');
  }.observes('component.isPlaying', 'component.seekTime', 'isLoaded').on('init'),

  updatePlayState: function() {
    if (this.get('isLoaded')) {
      var isPlaying = this.get('component.isPlaying');
      var seekTime = this.get('component.seekTime');
      var wavesurfer = this.get('wavesurfer');
      console.log("update wavesurfer playstate", isPlaying, seekTime);

      // TODO: handle time > end where?
      if (isPlaying) {
        wavesurfer.play(seekTime);
      } else if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
      } else {
        wavesurfer.seekToTime(seekTime);
      }
    }
  },

  createRegion: function(params) {
    return Region.create(_.defaults({
      wave: this,
    }, params));

    this.get('regions').pushObject(region);
    return region;
  },

  loadFile: function() {
    var file = this.get('file');
    var wavesurfer = this.get('wavesurfer');
    // console.log("load audioFile", wavesurfer, file);

    if (file && wavesurfer) {
      wavesurfer.loadBlob(file);
    }
  }.observes('wavesurfer', 'file'),

  loadStream: function() {
    var streamUrl = this.get('streamUrl');
    var wavesurfer = this.get('wavesurfer');
    // console.log("load streamUrl", wavesurfer, streamUrl);

    if (streamUrl && wavesurfer) {
      wavesurfer.load(streamUrl);
    }
  }.observes('wavesurfer', 'streamUrl'),

  reset: function() {
    this.set('isLoaded', false);
    this.resetProgress();
    this.resetWavesurfer();
    this.destroyRegions();
  },

  resetProgress: function() {
    this.destroyProgress();
    this.initProgress();
  },

  resetWavesurfer: function() {
    var wavesurfer = this.get('wavesurfer');
    wavesurfer && wavesurfer.reset();
  },

  destroyRegions: function() {
    this.get('regions').forEach(function(region) {
      region.destroy();
    });
    this.set('regions', []);
  },

  destroyProgress: function() {
    var progress = this.get('progress');
    progress && progress.destroy();
  },

  destroyWavesurfer: function() {
    var wavesurfer = this.get('wavesurfer');
    wavesurfer && wavesurfer.destroy();
  },

  destroy: function() {
    this.destroyProgress();
    this.destroyRegions();
    this.destroyWavesurfer();
    this._super.apply(this, arguments);
  },

  initWavesurfer: function(params) {
    // console.log('init wavesurfer', params, this.get('file'));
    var wave = this;
    var wavesurfer = Object.create(Wavesurfer);
    var progress = this.get('progress');

    wavesurfer.init(_.defaults({}, params, this.get('defaultParams')));
    wavesurfer.initRegions();

    // Setup Handlers
    wavesurfer.on('loading', function(percent, xhr) {
      // TODO: do something with xhr?
      wave.set('isLoaded', false);
      progress.onProgress(percent);
    });

    wavesurfer.on('ready', function() {
      wave.set('isLoaded', true);
      progress.onFinish();
    });

    wavesurfer.on('reset', function() {
      wave.reset();
    });

    wavesurfer.on('error', function(errorMessage) {
      progress.onError(errorMessage);
    });

    wavesurfer.on('finish', function() {
      wave.onFinish();
    });

    this.set('wavesurfer', wavesurfer);
  }
});

// Wraps Wavesurfer regions
export const Region = Ember.Object.extend(
  RequireAttributes('wave'), {

  // optional params
  start: undefined,
  end: undefined,
  resize: undefined,
  drag: undefined,
  loop: undefined,
  color: undefined,
  className: undefined,
  data: undefined,

  // params
  id: Ember.computed(function() { return Ember.uuid(); }),
  region: null,
  wavesurfer: Ember.computed.alias('wave.wavesurfer'),

  draw: function() {
    var wavesurfer = this.get('wavesurfer');
    var params = this.get('params');
    var region = this.get('region');

    if (!this.get('wave.isLoaded')) { return; }

    // console.log("draw region", params);
    if (!region) {
      this.set('region', wavesurfer.addRegion(params));
    } else {
      region.update(params);
    }
  }.observes('wave.isLoaded', 'wavesurfer', 'params').on('init'),

  destroy: function() {
    this.destroyRegion();
    this._super.apply(this, arguments);
  },

  destroyRegion: function() {
    var region = this.get('region');
    region && region.remove();
  },

  params: function(key, value) {
    return _.defaults({}, {
      id: this.get('id'),
      start: this.get('start'),
      end: this.get('end'),
      resize: this.get('resize'),
      drag: this.get('resize'),
      loop: this.get('resize'),
      color: this.get('color'),
      data: Ember.merge({
        className: this.get('className'),
      }, this.get('data')),
    }, this.get('defaultParams'));
  }.property('id', 'start', 'end', 'resize', 'drag', 'loop', 'color', 'className', 'data', 'defaultParams'),

  defaultParams: Ember.computed(function() {
    return {
      resize: false,
      drag: false,
      loop: false,
      color: 'black',
      start: 0,
      end: null,
      data: null,
      className: 'linx-region',
    };
  }),
});
