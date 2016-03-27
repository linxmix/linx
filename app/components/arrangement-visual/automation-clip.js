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
  controlPoints: Ember.computed.reads('clip.controlPoints'),
  height: 0,

  // optional params
  minControlPointBeat: 0,
  maxControlPointBeat: Ember.computed.reads('clip.beatCount'),
  canMoveControlPoint: true,

  actions: {
    onControlPointDrag(d3Context, controlPoint, dBeats, dHeight) {
      if (this.get('canMoveControlPoint')) {
        const oldValue = this.get('_dragStartValue');
        const oldBeat = this.get('_dragStartBeat');
        const height = this.get('height');

        // calculate new beat and value
        const prevControlPoint = controlPoint.get('prevItem');
        const nextControlPoint = controlPoint.get('nextItem');
        const minBeat = prevControlPoint ? prevControlPoint.get('beat') : this.get('minControlPointBeat');
        const maxBeat = nextControlPoint ? nextControlPoint.get('beat') : this.get('maxControlPointBeat');

        const beat = clamp(minBeat, oldBeat + dBeats, maxBeat);
        const value = clamp(0, oldValue - (dHeight / height), 1);

        // Ember.Logger.log('onControlPointDrag', dBeats, dHeight / height, beat, value)

        controlPoint.setProperties({
          beat,
          value,
        });
      }
    },

    onControlPointDragStart(d3Context, controlPoint) {
      this.setProperties({
        selectedControlPoint: controlPoint,
        _dragStartBeat: controlPoint.get('beat'),
        _dragStartValue: controlPoint.get('value')
      });
    },

    onControlPointDragEnd(d3Context, controlPoint) {
      this.setProperties({
        selectedControlPoint: null,
        _dragStartBeat: 0,
        _dragStartValue: 0,
      });
    },
  },

  // keep track of where controlPoint was at dragStart
  selectedControlPoint: null,
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
