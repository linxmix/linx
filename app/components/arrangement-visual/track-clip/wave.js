
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

  drawWaveform: join([0], 'path.TrackClipWave-waveform', {
    update(selection) {
      const median = this.get('height') / 2.0;
      const peaks = this.get('peaks');
      const peaksLength = peaks.get('length');

      const area = d3.svg.area()
        .x((peak, i) => {
          const percent = i / peaksLength;
          const beat = percent * peaksLength;
          return beat;
        })
        .y0(([ ymin, ymax ]) => median + ymin * median)
        .y1(([ ymin, ymax ]) => median + ymax * median);


      if (peaks.length) {
        selection
          .style('fill', this.get('waveColor'))
          .attr('d', area(peaks));
      }
    }
  }),
});
