import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'linx/mixins/d3/graphic-support';
import { join } from 'ember-cli-d3/utils/d3';

import BubbleActions from 'linx/lib/bubble-actions';
import multiply from 'linx/lib/computed/multiply';
import DraggableMixin from 'linx/mixins/components/arrangement-visual/draggable';

export default Ember.Component.extend(
  BubbleActions('onClick'),
  GraphicSupport('startBeat', 'beatCount', 'pxPerBeat', 'height', 'row'),
  DraggableMixin, {

  // required params
  clip: null,
  height: 0,
  pxPerBeat: 0,

  // optional params
  row: 0,
  isDraggable: false,
  isResizable: false,
  startBeat: Ember.computed.reads('clip.startBeat'),
  beatCount: Ember.computed.reads('clip.beatCount'),
  widthPx: multiply('beatCount', 'pxPerBeat'),

  actions: {
    onResizeStart(d3Context, d, dBeats) {},
    onResizeRight(d3Context, d, dBeats) {},
    onResizeLeft(d3Context, d, dBeats) {},
  },

  translateX: multiply('startBeat', 'pxPerBeat'),
  translateY: multiply('height', 'row'),

  // TODO(REFACTOR): make similar to cssStyle, transformStyle({ attrs })
  // TODO(REFACTOR): or use different transofmrs here https://www.dashingd3js.com/svg-group-element-and-d3js#svg-mini-language-div
  transform: Ember.computed('translateX', 'translateY', function() {
    const { translateX, translateY } = this.getProperties('translateX', 'translateY');
    return `translate(${translateX}, ${translateY})`;
  }),

  call(selection) {
    selection.classed('ArrangementVisualClip', true)
      .attr('transform', this.get('transform'))
      .call(this.get('drag'));

    this.backdrop(selection);
  },

  backdrop: join([0], 'rect.ArrangementVisualClip-backdrop', {
    update(selection) {
      selection
        .attr('height', this.get('height'))
        .attr('width', this.get('widthPx'))
        .on('click', () => this.send('onClick'));
    },
  }),
});
