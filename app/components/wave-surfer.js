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

  // TODO: keep these?
  start: 0,
  end: null,

  // optional params
  isPlaying: false,
  seekTime: 0,
  waveParams: null,

  // params
  pitch: 0, // semitones
  tempo: 1, // rate
  clock: null, // injected by app
  audioContext: Ember.computed.alias('clock.audioContext'),
  wave: Ember.computed(function() {
    return Wave.create({ component: this });
  }),

  onWaveLoad: function() {
    if (this.get('wave.isLoaded')) {
      this.sendAction('didLoadWave');
    }
  }.observes('wave.isLoaded').on('init'),

  initWave: function() {
    var wave = this.get('wave');

    var params = {
      container: this.$('.WaveSurfer-wave')[0],
      audioContext: this.get('audioContext')
    };

    wave.initWavesurfer(params);
  }.on('didInsertElement'),

  destroyWave: function() {
    var wave = this.get('wave');
    wave && wave.destroy();
  }.on('willDestroyElement'),
});

// Wraps Wavesurfer
export const Wave = Ember.Object.extend(
  RequireAttributes('component'), {

  // params
  wavesurfer: null,
  pitch: Ember.computed.alias('component.pitch'),
  tempo: Ember.computed.alias('component.tempo'),
  audioContext: Ember.computed.alias('component.audioContext'),
  file: Ember.computed.alias('component.file'),
  streamUrl: Ember.computed.alias('component.streamUrl'),
  seekTime: Ember.computed.alias('component.seekTime'),
  isPlaying: Ember.computed.alias('component.isPlaying'),
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
      scrollParent: false,
      cursorWidth: 2,
      renderer: 'Canvas',
      interact: false,
    };
  }),
  progress: Ember.computed(function() { return Progress.create(); }),

  playStateDidChange: function() {
    Ember.run.once(this, 'updatePlayState');
  }.observes('isPlaying', 'seekTime', 'isLoaded').on('init'),

  updatePlayState: function() {
    if (this.get('isLoaded')) {
      var isPlaying = this.get('component.isPlaying');
      var seekTime = this.get('component.seekTime');
      var wavesurfer = this.get('wavesurfer');
      // console.log("update wavesurfer playstate", isPlaying, seekTime);

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

  updateTempo: function() {
    var wavesurfer = this.get('wavesurfer');
    var tempo = this.get('tempo');
    if (wavesurfer) {
      wavesurfer.setTempo(tempo);
    }
  }.observes('wavesurfer', 'tempo'),

  updatePitch: function() {
    var wavesurfer = this.get('wavesurfer');
    var pitch = this.get('pitch');
    if (wavesurfer) {
      wavesurfer.setPitch(pitch);
    }
  }.observes('wavesurfer', 'pitch'),

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
  },

  resetProgress: function() {
    this.destroyProgress();
    this.initProgress();
  },

  resetWavesurfer: function() {
    var wavesurfer = this.get('wavesurfer');
    wavesurfer && wavesurfer.reset();
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
    this.destroyWavesurfer();
    this._super.apply(this, arguments);
  },

  initWavesurfer: function(params) {
    // console.log('init wavesurfer', params, this.get('file'));
    var wave = this;
    var wavesurfer = Object.create(Wavesurfer);
    var progress = this.get('progress');

    wavesurfer.init(_.defaults({}, params, this.get('defaultParams')));

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
  },

});
