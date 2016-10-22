import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import multiply from 'linx/lib/computed/multiply';

export default Ember.Component.extend(
  new GraphicSupport('peaks.[]', 'waveColor', 'height'), {

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

  drawWaveform: join('peaks', 'path.TrackClipWave-waveform', {
    update(selection) {
      const median = this.get('height') / 2.0;
      const peaksLength = this.get('peaks.length');

      const peaks = this.get('peaks');

      const freqScale = d3.scale.log()
        .domain([50, 22050])
        .range([0, 1])
        .clamp(true);

      selection
        .style('fill', ([ ymin, ymax, dominantFreq ], i) => {
          return (d3.hsl(freqScale(dominantFreq) * 360, 0.8, 0.5) + '') || this.get('waveColor');
        })
        .attr('d', (peak, i) => {
          const prevPeak = peaks[i - 1];
          const nextPeak = peaks[i + 1];

          const localPeaks = [prevPeak, peak, nextPeak].without(undefined);

          const area = d3.svg.area()
            // .x((peak, j) => (i + j) - (localPeaks.length / 2.0))
            .x((peak, j) => (i + j))
            .y0(([ ymin, ymax, dominantFreq ]) => median + ymin * median)
            .y1(([ ymin, ymax, dominantFreq ]) => median + ymax * median);

          return area(localPeaks);
        })
    }
  }),
});

