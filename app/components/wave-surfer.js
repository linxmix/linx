import Ember from 'ember';
import Wavesurfer from 'npm:wavesurfer.js';
import Progress from 'linx/lib/progress';
import RequireParams from 'linx/mixins/require-params';

RequireParams.reopen({
  params: ['clip'],
});

export default Ember.Component.extend(RequireParams, {
  classNames: ['wave-surfer'],

  // params
  wave: Ember.computed(function() { return WaveProxy.create(); }),
  progress: Ember.computed.alias('wave.progress'),
  defaultParams: {
    // audioContext: App.audioContext, TODO
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: 'white',
    minPxPerSec: 1,
    normalize: true,
    height: 128,
    fillParent: true,
    scrollParent: false,
    cursorWidth: 2,
    renderer: 'Canvas',
  },

  initWave: function() {
    var wave = this.get('wave');

    var params = {
      container: this.$('.wave')[0],
    };

    wave.initWavesurfer(Ember.merge(this.get('defaultParams'), params));
  }.on('didInsertElement'),

  destroyWave: function() {
    var wave = this.get('wave');
    wave && wave.destroy();
  }.on('willDestroyElement'),

  // TODO: better way to do this?
  updateWaveFile: function() {
    var wave = this.get('wave');
    var file = this.get('clip.file');

    wave && wave.set('file', file);
  }.observes('wave', 'clip.file').on('init'),
});

// Proxy object that holds Wavesurfer
export const WaveProxy = Ember.ObjectProxy.extend({

  // expected params
  file: null,

  // params
  wavesurfer: Ember.computed.alias('content'),
  isLoading: Ember.computed.alias('progress.isLoading'),
  isLoaded: false,
  
  progress: Ember.computed(function() { return Progress.create(); }),

  loadFile: function() {
    var file = this.get('file');
    var wavesurfer = this.get('wavesurfer');
    // console.log("load audio file", wavesurfer, file);

    if (file && wavesurfer) {
      wavesurfer.loadBlob(file);
    }
  }.observes('wavesurfer', 'file'),

  reset: function() {
    this.set('isLoaded', false);
    this.resetProgress();
    this.resetWavesurfer();
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

    wavesurfer.init(params);

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

    this.set('content', wavesurfer);
  }
});
