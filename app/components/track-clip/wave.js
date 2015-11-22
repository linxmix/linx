import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

  // TODO(REFACTOR) write wave component
export default Ember.Component.extend(
  BubbleActions(), RequireAttributes(), {

  actions: {},
  classNames: ['TrackClipWave'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

  // TODO: can this remove dependence on audioBpm?
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

});


export default Ember.Component.extend(
  RequireAttributes('audioSource'), {

  classNames: ['WaveSurfer'],

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
