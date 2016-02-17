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
  width: multiply('beatCount', 'pxPerBeat'),

  beatCount: Ember.computed.reads('clip.beatCount'),
  startBeat: null,
  // TODO(REFACTOR): make similar to cssStyle, transformStyle({ attrs })
  // TODO(REFACTOR): or use different transofmrs here https://www.dashingd3js.com/svg-group-element-and-d3js#svg-mini-language-div
  transform: Ember.computed('startBeat', 'pxPerBeat', function() {
    const translateX = this.get('startBeat') * this.get('pxPerBeat');
    return `translate(${translateX})`;
  }),

  call(selection) {
    selection.classed('ArrangementVisualClip', true)
      .attr('transform', this.get('transform'));

    this.backdrop(selection);
  },

  drag: Ember.computed(function() {
    return d3.behavior.drag();
  }),

  _initDragHandlers: Ember.on('init', function() {
    const drag = this.get('drag');
    const context = this;

    drag.on('drag', function() {
      context.sendAction('onDrag', context.get('clip'));
    });

    drag.on('dragstart', function() {
      d3.event.sourceEvent.stopPropagation(); // silence other listeners
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
