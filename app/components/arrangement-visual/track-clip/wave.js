import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import multiply from 'linx/lib/computed/multiply';

export default Ember.Component.extend(
  GraphicSupport('peaks.[]', 'waveColor', 'height'), {

  // optional params
  height: 125,
  waveColor: 'green',

  prevPeaks: null,
  call(selection) {
    this._super.apply(this, arguments);

    selection
      .classed('TrackClipWave', true);

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
