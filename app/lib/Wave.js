import Ember from 'ember';
import Wavesurfer from 'npm:wavesurfer.js';
import Progress from 'lib/progress';

export default Ember.ObjectProxy.extend({
  wavesurfer: Ember.computed.alias('content'),
  isLoading: Ember.computed.alias('progress.isLoading'),
  isLoaded: false,
  progress: null,

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

  initProgress: function() {
    this.set('progress', Progress.create());
  }.on('init'),

  initWavesurfer: function() {
    this.set('content', Object.create(Wavesurfer));
  }.on('init'),

  // TODO: make idempotent, make it redraw, add handlers
  drawWave: function(params) {
    var wave = this;
    var wavesurfer = this.get('wavesurfer');
    var progress = this.get('progress');

    wavesurfer.init(params);
    wavesurfer.initRegions();

    if (params.enableDragSelection) {
      wavesurfer.enableDragSelection({
        id: 'drag-selection',
        color: 'rgba(255, 255, 255, 0.4)',
        loop: false,
      });
    }

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
  }
});
