import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import DraggableMixin from 'linx/mixins/components/arrangement-visual/draggable';
import multiply from 'linx/lib/computed/multiply';

export default Ember.Component.extend(
  GraphicSupport('direction', 'isResizable', 'height', 'pxPerBeat', 'widthPx', 'handleWidthPx'),
  DraggableMixin, {

  // required params
  direction: '', // one of 'left' or 'right'
  height: 0,
  pxPerBeat: 0,
  widthPx: 0,

  // optional params
  isResizable: false,
  handleWidthPx: multiply(1, 'pxPerBeat'),

  // implement draggable mixin
  isDraggable: Ember.computed.reads('isResizable'),

  call(selection) {
    const { direction, isResizable, widthPx } = this.getProperties('direction', 'isResizable');
    const isVisible = isResizable && Ember.isPresent(direction);

    selection.classed('ArrangementVisualClipResizeHandle', true)
      // TODO(REFACTOR2): can visibility be a mixin? similar to transform mixin?
      .style('visibility', isVisible ? 'visible' : 'hidden')
      .call(this.get('drag'));

    this.drawHandle(selection);
  },

  xPos: Ember.computed('direction', 'widthPx', 'handleWidthPx', function() {
    const { direction, widthPx, handleWidthPx } = this.getProperties('direction', 'widthPx', 'handleWidthPx');

    switch(direction) {
      case 'left': return -handleWidthPx;
      case 'right': return widthPx;
    }
  }),

  drawHandle: join([0], 'rect.ArrangementVisualClipResizeHandle-rect', {
    update(selection) {
      const xPos = this.get('xPos');

      selection
        .attr('x', xPos)
        .attr('height', this.get('height'))
        .attr('width', this.get('handleWidthPx'))
    },
  }),
});
