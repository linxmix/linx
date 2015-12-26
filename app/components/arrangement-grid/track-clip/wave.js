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
  RequireAttributes('peaks'), {

  actions: {},
  classNames: ['TrackClipWave'],
  classNameBindings: [],

  // params
  // audioBuffer: null,
  // audioStartTime: Ember.computed.reads('clip.audioStartTime'),
  // audioEndTime: Ember.computed.reads('clip.audioEndTime'),
  // TODO(REFACTOR): figure this out (which offset direction is correct?)
  // visually align the segment of audio represented by this clip
  // waveOffset: multiply('clip.audioOffset', 'pxPerBeat', -1.0),
  // waveOffsetStyle: toPixels('waveOffset'),

  stroke: d3.scale.category10(),
  defaultMargin: { left: 50, right: 0, top: 0, bottom: 50 },

  peaksArea: Ember.computed('peaks', function() {
    return [this.get('peaks') || []];
  }),

  call: join('peaksArea', 'waveform.area', {
    enter(sel) {
      console.log("ENTER", this.get('peaks.length'));
      const median = 125 / 2;
      const scale = 125 / 2;

      const area = d3.svg.area()
        .x((d, i) => i)
        .y0(median)
        .y1((d) => d[1] * scale);

      sel.append('path')
        // .attr('y1', function(d) { return median + scale * d[0]; })
        // .attr('y2', function(d) { return median + scale * d[1]; })
        // .attr('x1', function(d, i) { return i; })
        // .attr('x2', function(d, i) { return i; })
        .attr("stroke-width", 1)
        .attr("stroke", "green")
        .style("fill", "#ff0000")
        .attr('d', area);
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
