import Ember from 'ember';
import Wavesurfer from 'npm:wavesurfer.js';
import Progress from 'linx/lib/progress';

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

  // params
  audioContext: null, // injected by app
  wave: Ember.computed(function() {
    return WaveProxy.create({
      component: this,
    });
  }),
  progress: Ember.computed.alias('wave.progress'),
  defaultParams: {
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
      audioContext: this.get('audioContext.context')
    };

    wave.initWavesurfer(Ember.merge(this.get('defaultParams'), params));
  }.on('didInsertElement'),

  destroyWave: function() {
    var wave = this.get('wave');
    wave && wave.destroy();
  }.on('willDestroyElement'),
});

// Proxy object that holds Wavesurfer
export const WaveProxy = Ember.ObjectProxy.extend({

  // expected params
  component: null,

  // params
  content: null,
  file: Ember.computed.alias('component.file'),
  streamUrl: Ember.computed.alias('component.streamUrl'),
  wavesurfer: Ember.computed.alias('content'),
  isLoading: Ember.computed.alias('progress.isLoading'),
  isLoaded: false,
  
  progress: Ember.computed(function() { return Progress.create(); }),

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
