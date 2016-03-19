import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import multiply from 'linx/lib/computed/multiply';

export default Ember.Component.extend(
  GraphicSupport('peaks.[]', 'waveColor', 'height', 'displayWaveform'), {

  // optional params
  displayWaveform: true,
  height: 125,
  waveColor: 'green',

  prevPeaks: null,
  call(selection) {
    const transform = this.get('transform');

    if (!this.get('displayWaveform')) {
      selection.style('visibility', 'hidden');
      return;
    } else {
      selection.style('visibility', 'visible');
    }

    selection
      .classed('TrackClipWave', true)
      .attr('transform', this.get('transform'));

    const newPeaks = this.get('peaks');
    if (newPeaks !== this.get('prevPeaks')) {
      this.drawWaveform(selection);
      this.set('prevPeaks', newPeaks);
    }
  },

  drawWaveform: join([0], 'path.TrackClipWave-waveform', {
    update(selection) {
      const median = this.get('height') / 2.0;

      const area = d3.svg.area()
        .x(([ x, [ ymin, ymax ] ]) => x)
        .y0(([ x, [ ymin, ymax ] ]) => median + ymin * median)
        .y1(([ x, [ ymin, ymax ] ]) => median + ymax * median);

      const peaks = this.get('peaks');

      if (peaks.length) {
        selection
          .style('fill', this.get('waveColor'))
          .attr('d', area(peaks));
      }
    }
  }),
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
