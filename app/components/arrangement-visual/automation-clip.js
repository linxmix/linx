import Ember from 'ember';

import d3 from 'd3';
import _ from 'npm:underscore';
import { join } from 'ember-cli-d3/utils/d3';

import Clip from './clip';
import { timeToBeat as staticTimeToBeat } from 'linx/lib/utils';

export default Clip.extend({
  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualAutomationClip', true);

    this.drawPath(selection);
    this.drawControlPoints(selection);
  },

  controlPoints: Ember.computed.reads('clip.sortedControlPoints'),

  drawPath: join([0], 'path.ArrangementVisualAutomationClip-path', {
    update(selection) {
      const height = this.get('height');
      const controlPoints = this.get('controlPoints');
      const pxPerBeat = this.get('pxPerBeat');
      const line = d3.svg.line()
        .x((d) => d.beat * pxPerBeat)
        .y((d) => d.value * height)
        .interpolate('monotone');

      if (controlPoints.length) {
        selection
          .style('stroke', 'magenta')
          .style('fill', 'transparent')
          .attr('d', line(controlPoints));
      }
    }
  }),

  drawControlPoints: join('controlPoints', 'circle.ArrangementVisualAutomationClip-ControlPoint', {
    update(selection) {
      const height = this.get('height');
      const pxPerBeat = this.get('pxPerBeat');

      selection
        .attr('cx', (d) => d.beat * pxPerBeat)
        .attr('cy', (d) => d.value * height)
        .attr('r', 10)
        .style('fill', '#B8DE44')
    }
  }),
});
