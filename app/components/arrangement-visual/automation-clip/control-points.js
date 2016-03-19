import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import DraggableMixin from 'linx/mixins/components/arrangement-visual/draggable';

export default Ember.Component.extend(
  DraggableMixin,
  GraphicSupport('controlPoints.@each.{beat,value}'), {

  // required params
  controlPoints: null,

  call(selection) {
    selection.classed('ArrangementVisualAutomationClipControlPoints', true);

    this.drawControlPoints(selection);
  },

  drawControlPoints: join('controlPoints', 'circle.ArrangementVisualAutomationClip-ControlPoint', {
    update(selection) {
      const height = this.get('height');
      const pxPerBeat = this.get('pxPerBeat');

      selection
        .attr('cx', (controlPoint) => controlPoint.get('beat') * pxPerBeat)
        .attr('cy', (controlPoint) => (1 - controlPoint.get('value')) * height)
        .attr('r', 10)
        .style('fill', '#B8DE44')
        .call(this.get('drag'));
    }
  }),

});

