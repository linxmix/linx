import Ember from 'ember';
import d3 from 'd3';

import GraphicSupport from 'ember-cli-d3/mixins/d3-support';
import { join } from 'ember-cli-d3/utils/d3';

import RequireAttributes from 'linx/lib/require-attributes';
import multiply from 'linx/lib/computed/multiply';

// TODO(REFACTOR) write wave component
// http://stackoverflow.com/questions/26207636/drawing-a-waveform-with-d3
export default Ember.Component.extend(
  GraphicSupport,
  RequireAttributes('clip'), {

  actions: {},
  classNames: ['TrackClipWave'],
  classNameBindings: [],

  // params
  track: Ember.computed.reads('clip.track'),
  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),
  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  // visually align the segment of audio represented by this clip
  // TODO(REFACTOR): figure out which offset direction is correct
  waveOffset: multiply('clip.audioOffset', 'pxPerBeat', -1.0),
  // waveOffsetStyle: toPixels('waveOffset'),

  waveformData: Ember.computed('audioBuffer', function() {
    let audioBuffer = this.get('audioBuffer');
    if (!audioBuffer) { console.log("EMPTY waveform data"); return []; }

    let data = audioBuffer.getChannelData(0);
    console.log('waveformData', data);
    return data;
  }),

  stroke: d3.scale.category10(),
  defaultMargin: { left: 50, right: 0, top: 0, bottom: 50 },

  call: join('waveformData', '.waveform', {
    enter(sel) {
      sel.append('line')
        .attr('y1', function(d) { return d[0]; })
        .attr('y2', function(d) { return d[1]; })
        .attr('x1', function(d, i) { return i +0.5; })
        .attr('x2', function(d, i) { return i +0.5; })
        .attr("stroke-width", 1)
        .attr("stroke", "green");
    },
  })
});

// TODO: can this remove dependence on audioBpm?
// updateZoom: function() {
//   var wavesurfer = this.get('wavesurfer');
//   var pxPerBeat = this.get('pxPerBeat');
//   var audioBpm = this.get('audioBpm');
//   var isLoaded = this.get('isLoaded');
//   if (isLoaded && wavesurfer && isNumber(pxPerBeat) && isNumber(audioBpm)) {
//     var pxPerSec = pxPerBeat * bpmToBps(audioBpm);
//     wavesurfer.zoom(pxPerSec);
//   }
// }.observes('wavesurfer', 'isLoaded', 'pxPerBeat', 'audioBpm'),

// export default Ember.Component.extend(
//   RequireAttributes('audioSource'), {

//   classNames: ['WaveSurfer'],

//   // optional params
//   audioBpm: null,
//   isPlaying: false,
//   seekTime: 0,
//   waveParams: null,
//   pxPerBeat: 15,
//   disableMouseInteraction: false,

//   // params
//   pitch: 0, // semitones
//   tempo: 1, // rate
//   volume: 0,
//   session: Ember.inject.service(),
// });

// // TODO(WAVECOLOR): remove hack
// const WAVE_COLORS = [{
//     wave: 'violet',
//     progress: 'purple'
//   }, {
//     wave: 'steelblue',
//     progress: 'darkblue'
//   },
// ];

// // {
// //   wave: 'coral',
// //   progress: 'orangered'
// // }

// var waveColor = 0;
// function getWaveColor() {
//   return WAVE_COLORS[waveColor++ % WAVE_COLORS.length];
// }
