import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import multiply from 'linx/lib/computed/multiply';

export default Ember.Component.extend(
  GraphicSupport('peaks.[]', 'waveColor', 'height'), {

  // required params
  peaks: null,

  // optional params
  height: 125,
  waveColor: 'green',

  call(selection) {
    this._super.apply(this, arguments);

    selection
      .classed('TrackClipWave', true);

    this.drawWaveform(selection);
  },

  drawWaveform: join('peaks', 'line.TrackClipWave-waveform', {
    update(selection) {
      const median = this.get('height') / 2.0;
      const peaksLength = this.get('peaks.length');

      selection
        .attr('x1', (peak, i) => {
          return i + 0.5;
        })
        .attr('x2', (peak, i) => {
          return i + 0.5;
        })
        .attr('y1', ([ x, [ ymin, ymax, dominantFreq ] ]) => median + ymin * median)
        .attr('y2', ([ x, [ ymin, ymax, dominantFreq ] ]) => median + ymax * median)
        .attr('stroke-width', 1)
        .style('stroke', (d, i) => {
          const percent = i / peaksLength;
          // console.log("FILL STYLE", d, i, d3.hsl(percent * 360, 1, 0.5) + "");

          // TODO: map dominant frequency to color
          return (d3.hsl(percent * 360, 1, 0.5) + "") || this.get('waveColor');
        })
    }
  }),
});

// OLD drawWaveform
  // const peaks = this.get('peaks');
  // const peaksLength = peaks.get('length');

  // const area = d3.svg.area()
  //   .x(([ x, [ ymin, ymax, dominantFreq ] ]) => x)
  //   .y0(([ x, [ ymin, ymax, dominantFreq ] ]) => median + ymin * median)
  //   .y1(([ x, [ ymin, ymax, dominantFreq ] ]) => median + ymax * median);


  // console.log("PEAKS", peaks)

  // if (peaks.length) {
  //   selection
  //     .style('fill', this.get('waveColor'))
  //     .attr('d', area(peaks));

  //   selection.selectAll('d')
  //     .style('fill', (d) => { console.log("FILL", d); return 'green'})
  // }

const FREQUENCY_COLOR_BANDS = [
  {
    frequency: 60,
    color: '#FF0000'
  },
  // {
  //   frequency: 300,
  //   color: 'red'
  // },
  // {
  //   frequency: 560,
  //   color: '#00FF00'
  // },
  {
    frequency: 4200,
    color: '#00FF00'
  },
  {
    frequency: 18000,
    color: '#0000FF'
  },
];

const FREQUENCY_COLOR_SCALE = d3.scale.ordinal()
  .domain(FREQUENCY_COLOR_BANDS.mapBy('frequency'))
  .range(FREQUENCY_COLOR_BANDS.mapBy('color'));

function frequencyToColor(freq) {
  return FREQUENCY_COLOR_SCALE(freq);
}
