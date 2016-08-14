
import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import multiply from 'linx/lib/computed/multiply';

export default Ember.Component.extend(
  GraphicSupport('peaks.[]', 'waveColor', 'height', 'startBar', 'endBar', 'pxPerBeat', 'trackBarCount', 'showBarGrid'), {

  // required params
  peaks: null,
  trackBarCount: 0,

  // optional params
  height: 125,
  waveColor: 'green',
  showBarGrid: true,

  minX: 0,
  maxX: multiply('trackBeatCount', 'pxPerBeat'),

  barScale: Ember.computed('startBar', 'endBar', 'minX', 'maxX', function () {
    const domainMin = this.get('startBar');
    const domainMax = this.get('endBar');

    return d3.scale.linear().domain([domainMin, domainMax]).range([this.get('minX'), this.get('maxX')]);
  }).readOnly(),

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
