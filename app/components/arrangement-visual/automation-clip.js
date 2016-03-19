import Ember from 'ember';

import d3 from 'd3';
import _ from 'npm:underscore';
import { join } from 'ember-cli-d3/utils/d3';

import GraphicSupport from 'linx/mixins/d3/graphic-support';
import Clip from './clip';
import {
  clamp,
  timeToBeat as staticTimeToBeat
} from 'linx/lib/utils';

export default Clip.extend(
  GraphicSupport('controlPoints.@each.{beat,value}'), {

  // required params
  controlPoints: Ember.computed.reads('clip.sortedControlPoints'),
  height: 0,

  actions: {
    onControlPointDrag(d3Context, controlPoint, dBeats, dHeight) {
      const oldValue = this.get('_dragStartValue');
      const oldBeat = this.get('_dragStartBeat');
      const height = this.get('height');

      // calculate new beat and value
      const beat = clamp(this.get('clip.startBeat'), oldBeat + dBeats, this.get('clip.beatCount'));
      const value = clamp(0, oldValue - (dHeight / height), 1);

      console.log('onControlPointDrag', dBeats, dHeight / height, beat, value)

      controlPoint.setProperties({
        beat,
        value,
      });
    },

    onControlPointDragStart(d3Context, controlPoint) {
      this.setProperties({
        _dragStartBeat: controlPoint.get('beat'),
        _dragStartValue: controlPoint.get('value')
      });
    },
  },

  // keep track of where controlPoint was at dragStart
  _dragStartBeat: 0,
  _dragStartValue: 0,

  // used to control svg insertion order (z-index)
  _drawControlPoints: false,

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualAutomationClip', true);

    this.drawPath(selection);
    this.set('_drawControlPoints', true);
  },

  drawPath: join([0], 'path.ArrangementVisualAutomationClip-path', {
    update(selection) {
      const height = this.get('height');
      const controlPoints = this.get('controlPoints');
      const pxPerBeat = this.get('pxPerBeat');
      const line = d3.svg.line()
        .x((controlPoint) => controlPoint.get('beat') * pxPerBeat)
        .y((controlPoint) => (1 - controlPoint.get('value')) * height)
        .interpolate('linear');

      if (controlPoints.length) {
        selection
          .style('stroke', 'magenta')
          .style('fill', 'transparent')
          .attr('d', line(controlPoints));
      }
    }
  }),
});
