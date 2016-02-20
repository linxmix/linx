import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';
import { join } from 'ember-cli-d3/utils/d3';

import RequireAttributes from 'linx/lib/require-attributes';
import multiply from 'linx/lib/computed/multiply';

// TODO(REFACTOR): do we need this anymore? mixin?
export default Ember.Component.extend(
  GraphicSupport,
  RequireAttributes('clip', 'pxPerBeat'), {

  height: 0,
  row: 0,
  width: multiply('beatCount', 'pxPerBeat'),

  beatCount: Ember.computed.reads('clip.beatCount'),
  startBeat: null,
  // TODO(REFACTOR): make similar to cssStyle, transformStyle({ attrs })
  // TODO(REFACTOR): or use different transofmrs here https://www.dashingd3js.com/svg-group-element-and-d3js#svg-mini-language-div
  transform: Ember.computed('startBeat', 'pxPerBeat', 'height', 'row', function() {
    const translateX = this.get('startBeat') * this.get('pxPerBeat');
    const translateY = this.get('height') * this.get('row');
    return `translate(${translateX}, ${translateY})`;
  }),

  call(selection) {
    selection.classed('ArrangementVisualClip', true)
      .attr('transform', this.get('transform'));

    this.backdrop(selection);
  },

  drag: Ember.computed(function() {
    return d3.behavior.drag();
  }),

  _dragBeatCount: 0,
  _initDragHandlers: Ember.on('init', function() {
    const drag = this.get('drag');
    const context = this;

    drag.on('drag', function() {
      let dragBeatCount = context.get('_dragBeatCount');
      dragBeatCount += d3.event.dx / context.get('pxPerBeat');
      context.set('_dragBeatCount', dragBeatCount);

      context.sendAction('onDrag', context.get('clip'), dragBeatCount);
    });

    drag.on('dragstart', function() {
      d3.event.sourceEvent.stopPropagation(); // silence other listeners

      context.sendAction('onDragStart', context.get('clip'));
    });

    drag.on('dragend', function() {
      d3.event.sourceEvent.stopPropagation(); // silence other listeners
      context.set('_dragBeatCount', 0);

      context.sendAction('onDragEnd', context.get('clip'));
    });
  }),

  backdrop: join([0], 'rect.ArrangementVisualClip-backdrop', {
    update(selection) {
      selection
        .attr('height', this.get('height'))
        .attr('width', this.get('width'))
        .on('click', () => this.sendAction('onClick', this.get('clip')))
        .call(this.get('drag'));
    },
    exit(selection) {
      selection
        .on('.drag', null);
    }
  }),
});
