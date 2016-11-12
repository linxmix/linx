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
  GraphicSupport('controlPoints.@each.{beat,scaledValue}'), {

  // required params
  controlPoints: Ember.computed.reads('clip.controlPoints'),
  height: 0,

  // optional params
  minControlPointBeat: 0,
  maxControlPointBeat: Ember.computed.reads('clip.beatCount'),
  canMoveSelectedControlPointBeat: true,

  actions: {
    onControlPointDrag(d3Context, controlPoint, dBeats, dHeight) {
      const oldValue = this.get('_dragStartValue');
      const oldBeat = this.get('_dragStartBeat');
      const height = this.get('height');
      let dValue = (dHeight / height);

      const isAltKeyHeld = Ember.get(d3, 'event.sourceEvent.altKey') || Ember.get(d3, 'event.altKey');
      if (isAltKeyHeld) {
        dBeats /= 15.0;
        dValue /= 10.0;
      }

      // calculate new beat and value
      const prevControlPoint = controlPoint.get('prevItem');
      const nextControlPoint = controlPoint.get('nextItem');
      const minBeat = prevControlPoint ? prevControlPoint.get('beat') : this.get('minControlPointBeat');
      const maxBeat = nextControlPoint ? nextControlPoint.get('beat') : this.get('maxControlPointBeat');

      const beat = clamp(minBeat, oldBeat + dBeats,
        maxBeat);
      const scaledValue = clamp(0, oldValue - dValue, 1);

      // Ember.Logger.log('onControlPointDrag', dBeats, dHeight / height, beat, scaledValue)
      if (this.get('canMoveSelectedControlPointBeat')) {
        controlPoint.setProperties({
          beat,
          scaledValue,
        });
      } else {
        controlPoint.setProperties({
          scaledValue,
        });
      }
    },

    onControlPointDragStart(d3Context, controlPoint) {
      this.setProperties({
        selectedControlPoint: controlPoint,
        _dragStartBeat: controlPoint.get('beat'),
        _dragStartValue: controlPoint.get('scaledValue')
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

    if (this.get('controlPoints.length')) {
      this.drawPath(selection);
      this.drawOverlay(selection);
      this.set('_drawControlPoints', true);
    }
  },

  drawPath: join([0], 'path.ArrangementVisualAutomationClip-path', {
    update(selection) {
      const height = this.get('height');
      const controlPoints = this.get('controlPoints');
      const pxPerBeat = this.get('pxPerBeat');
      const line = d3.svg.line()
        .x((controlPoint) => controlPoint.get('beat') * pxPerBeat)
        .y((controlPoint) => (1 - controlPoint.get('scaledValue')) * height)
        .interpolate('linear');

      if (controlPoints.length) {
        selection
          .style('stroke', 'magenta')
          .style('fill', 'transparent')
          .attr('d', line(controlPoints));
      }
    }
  }),

  drawOverlay: join([0], 'path.ArrangementVisualAutomationClip-overlay', {
    update(selection) {
      const height = this.get('height');
      const controlPoints = this.get('controlPoints');
      const pxPerBeat = this.get('pxPerBeat');
      const area = d3.svg.area()
        .x((controlPoint) => controlPoint.get('beat') * pxPerBeat)
        .y((controlPoint) => (1 - controlPoint.get('scaledValue')) * height)
        .y0(0)
        .interpolate('linear');

      if (controlPoints.length) {
        selection
          .attr('d', area(controlPoints));
      }
    }
  }),
});
