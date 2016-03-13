import Ember from 'ember';

import d3 from 'd3';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';
import { join } from 'ember-cli-d3/utils/d3';

import RequireAttributes from 'linx/lib/require-attributes';
import multiply from 'linx/lib/computed/multiply';
import DraggableMixin from 'linx/mixins/components/arrangement-visual/draggable';

// TODO(REFACTOR): do we need this anymore? mixin?
export default Ember.Component.extend(
  GraphicSupport,
  DraggableMixin,
  RequireAttributes('pxPerBeat'), {

  // required params
  beatCount: null,
  startBeat: null,
  pxPerBeat: 0,
  height: 0,
  row: 0,

  width: multiply('beatCount', 'pxPerBeat'),

  // TODO(REFACTOR): make similar to cssStyle, transformStyle({ attrs })
  // TODO(REFACTOR): or use different transofmrs here https://www.dashingd3js.com/svg-group-element-and-d3js#svg-mini-language-div
  transform: Ember.computed('startBeat', 'pxPerBeat', 'height', 'row', function() {
    const translateX = this.get('startBeat') * this.get('pxPerBeat');
    const translateY = this.get('height') * this.get('row');
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
        .attr('width', this.get('width'))
        .on('click', () => this.sendAction('onClick'));
    },
    exit(selection) {
      selection
        .on('.drag', null);
    }
  }),
});
