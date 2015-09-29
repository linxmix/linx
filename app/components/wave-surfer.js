import Ember from 'ember';
import Wavesurfer from 'linx/lib/wavesurfer';
import _ from 'npm:underscore';
import RequireAttributes from 'linx/lib/require-attributes';
import { bpmToBps, isNumber } from 'linx/lib/utils';

// Wraps Wavesurfer
export const Wave = Ember.Object.extend(
  RequireAttributes('component'), {

  // params
  wavesurfer: null,

  pitch: Ember.computed.reads('component.pitch'),
  tempo: Ember.computed.reads('component.tempo'),
  volume: Ember.computed.reads('component.volume'),

  audioContext: Ember.computed.reads('component.audioContext'),

  file: Ember.computed.reads('component.file'),
  streamUrl: Ember.computed.reads('component.streamUrl'),
  arrayBuffer: Ember.computed.reads('component.arrayBuffer'),
  decodedBuffer: Ember.computed.reads('component.decodedBuffer'),

  seekTime: Ember.computed.reads('component.seekTime'),
  pxPerBeat: Ember.computed.reads('component.pxPerBeat'),
  audioBpm: Ember.computed.reads('component.audioBpm'),
  isPlaying: Ember.computed.reads('component.isPlaying'),
  disableMouseInteraction: Ember.computed.reads('component.disableMouseInteraction'),
  isLoaded: false,
  defaultParams: Ember.computed(function() {
    var colorOptions = getWaveColor();
    return {
      waveColor: colorOptions.wave,
      progressColor: colorOptions.progress,
      cursorColor: 'white',
      minPxPerSec: 20,
      normalize: true,
      height: 128,
      fillParent: false,
      scrollParent: false,
      cursorWidth: 2,
      renderer: 'Canvas',
      interact: !this.get('disableMouseInteraction'),
    };
  }),

  updatePlayState: function() {
    var wavesurfer = this.get('wavesurfer');
    if (wavesurfer && this.get('isLoaded')) {
      var wavesurferIsPlaying = wavesurfer.isPlaying();
      var isPlaying = this.get('isPlaying');

      // sync isPlaying and wavesurfer
      if (isPlaying && !wavesurferIsPlaying) {
        wavesurfer.play();
      } else if (!isPlaying && wavesurferIsPlaying) {
        wavesurfer.pause();
      }
    }
  }.observes('wavesurfer', 'isPlaying', 'isLoaded').on('init'),

  updatePlayTime: function() {
    var wavesurfer = this.get('wavesurfer');
    if (wavesurfer && this.get('isLoaded')) {
      var currentTime = wavesurfer.getCurrentTime() || 0;
      var seekTime = this.get('seekTime');
      var isPlaying = this.get('isPlaying');

      // console.log("updatePlayTime", seekTime, currentTime);

      // if playing, only seek if seekTime and currentTime have diverged
      if (!isPlaying || Math.abs(seekTime - currentTime) >= 0.01) {
        wavesurfer.seekToTime(seekTime);
      }
    }
  }.observes('wavesurfer', 'isLoaded', 'isPlaying', 'seekTime').on('init'),

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

  updateVolume: function() {
    var wavesurfer = this.get('wavesurfer');
    var volume = this.get('volume');
    if (wavesurfer) {

      // TODO(EASY): remove this check, only for two-way binding to input
      try {
        volume = parseFloat(volume);
      } catch(e) {}

      if (typeof volume !== 'number' || !volume) {
        volume = 0;
      }

      wavesurfer.setVolume(volume);
    }
  }.observes('wavesurfer', 'volume'),

  updateZoom: function() {
    var wavesurfer = this.get('wavesurfer');
    var pxPerBeat = this.get('pxPerBeat');
    var audioBpm = this.get('audioBpm');
    var isLoaded = this.get('isLoaded');
    if (isLoaded && wavesurfer && isNumber(pxPerBeat) && isNumber(audioBpm)) {
      var pxPerSec = pxPerBeat * bpmToBps(audioBpm);
      wavesurfer.zoom(pxPerSec);
    }
  }.observes('wavesurfer', 'isLoaded', 'pxPerBeat', 'audioBpm').on('init'),

  loadFile: function() {
    var file = this.get('file');
    var wavesurfer = this.get('wavesurfer');
    // console.log("load audioFile", wavesurfer, file);

    if (file && wavesurfer) {
      wavesurfer.loadBlob(file);
    }
  }.observes('wavesurfer', 'file'),

  loadArrayBuffer: function() {
    var arrayBuffer = this.get('arrayBuffer');
    var wavesurfer = this.get('wavesurfer');
    // console.log("load audioFile", wavesurfer, arrayBuffer);

    if (arrayBuffer && wavesurfer) {
      wavesurfer.loadArrayBuffer(arrayBuffer);
    }
  }.observes('wavesurfer', 'arrayBuffer'),

  loadDecodedBuffer: function() {
    var decodedBuffer = this.get('decodedBuffer');
    var wavesurfer = this.get('wavesurfer');
    // console.log("load audioFile", wavesurfer, decodedBuffer);

    if (decodedBuffer && wavesurfer) {
      wavesurfer.loadDecodedBuffer(decodedBuffer);
    }
  }.observes('wavesurfer', 'decodedBuffer'),

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
      // progress.onProgress(percent);
    });

    wavesurfer.on('ready', function() {
      wave.set('isLoaded', true);
      // progress.onFinish();
    });

    wavesurfer.on('reset', function() {
      wave.reset();
    });

    wavesurfer.on('error', function(errorMessage) {
      progress.onError(errorMessage);
    });

    wavesurfer.on('finish', function() {
      wavesurfer.pause();
      // wave.onFinish();
    });

    this.set('wavesurfer', wavesurfer);
  },

});


export default Ember.Component.extend(
  RequireAttributes('audioSource'), {

  classNames: ['WaveSurfer'],

  file: Ember.computed.reads('audioSource.file'),
  streamUrl: Ember.computed.reads('audioSource.streamUrl'),
  arrayBuffer: Ember.computed.reads('audioSource.arrayBuffer'),
  decodedBuffer: Ember.computed.reads('audioSource.decodedBuffer'),

  // optional params
  audioBpm: null,
  isPlaying: false,
  seekTime: 0,
  waveParams: null,
  pxPerBeat: 15,
  disableMouseInteraction: false,

  // params
  pitch: 0, // semitones
  tempo: 1, // rate
  volume: 0,
  session: Ember.inject.service(),
  wave: Ember.computed(function() {
    return Wave.create({ component: this });
  }),

  onWaveLoad: function() {
    if (this.get('wave.isLoaded')) {
      this.sendAction('waveDidLoad');
    }
  }.observes('wave.isLoaded').on('init'),

  onWaveFinish() {
    this.sendAction('waveDidFinish');
  },

  initWave: function() {
    var wave = this.get('wave');

    var params = {
      container: this.$('.WaveSurfer-wave')[0],
      audioContext: this.get('session.audioContext')
    };

    wave.initWavesurfer(params);
  }.on('didInsertElement'),

  destroyWave: function() {
    var wave = this.get('wave');
    wave && wave.destroy();
  }.on('willDestroyElement'),
});

// TODO(WAVECOLOR): remove hack
const WAVE_COLORS = [{
    wave: 'violet',
    progress: 'purple'
  }, {
    wave: 'steelblue',
    progress: 'darkblue'
  },
];

// {
//   wave: 'coral',
//   progress: 'orangered'
// }

var waveColor = 0;
function getWaveColor() {
  return WAVE_COLORS[waveColor++ % WAVE_COLORS.length];
}
