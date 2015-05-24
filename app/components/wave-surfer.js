import Ember from 'ember';
import Progress from 'linx/lib/progress';
import Wavesurfer from 'linx/lib/wavesurfer';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

export default Ember.Component.extend({
  classNames: ['wave-surfer'],

  // expected params
  file: null,
  streamUrl: null,

  // optional params
  // TODO: create wavesurfer region, update when start/end change
  start: 0,
  end: null,
  isPlaying: false,
  waveParams: null,
  beats: null, // array of floats (second)

  // params
  audioContext: null, // injected by app
  wave: Ember.computed(function() {
    return Wave.create({
      component: this,
    });
  }),
  progress: Ember.computed.alias('wave.progress'),

  drawBeats: function() {
    var beats = this.get('beats');
    var wave = this.get('wave');

    console.log('draw beats', wave, beats);
    if (wave && beats) {
      beats.forEach(function(beat) {
        wave.createRegion({
          start: beat,
          color: 'green',
          className: 'beat',
        });
      });
    }
  }.observes('beats.[]', 'wave'),

  initWave: function() {
    var wave = this.get('wave');

    var params = {
      container: this.$('.wave')[0],
      audioContext: this.get('audioContext.context')
    };

    wave.initWavesurfer(params);
  }.on('didInsertElement'),

  destroyWave: function() {
    var wave = this.get('wave');
    wave && wave.destroy();
  }.on('willDestroyElement'),
});

// Wraps Wavesurfer
export const Wave = Ember.ObjectProxy.extend({

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
    console.log("load audioFile", wavesurfer, file);

    if (file && wavesurfer) {
      wavesurfer.loadBlob(file);
    }
  }.observes('wavesurfer', 'file'),

  loadStream: function() {
    var streamUrl = this.get('streamUrl');
    var wavesurfer = this.get('wavesurfer');
    console.log("load streamUrl", wavesurfer, streamUrl);

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

  destroyRegions: function() {
    this.get('regions').forEach(function(region) {
      region.destroy();
    });
    this.set('regions', []);
  },

  resetProgress: function() {
    this.destroyProgress();
    this.initProgress();
  },

  destroyProgress: function() {
    var progress = this.get('progress');
    progress && progress.destroy();
  }.on('destroy'),

  resetWavesurfer: function() {
    var wavesurfer = this.get('wavesurfer');
    wavesurfer && wavesurfer.reset();
  },

  destroyWavesurfer: function() {
    var wavesurfer = this.get('wavesurfer');
    wavesurfer && wavesurfer.destroy();
  }.on('destroy'),

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

    console.log("draw region", params);
    if (!region) {
      this.set('region', wavesurfer.addRegion(params));
    } else {
      region.update(params);
    }
  }.observes('wavesurfer', 'params').on('init'),

  destroy: function() {
    this.destroyRegion();
    this._super.apply(this, arguments);
  },

  destroyRegion: function() {
    var region = this.get('region');
    region && region.remove();
  }.on('destroy'),

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
