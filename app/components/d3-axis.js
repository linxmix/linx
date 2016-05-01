import Ember from 'ember';
import d3 from 'd3';

import GraphicSupport from 'linx/mixins/d3/graphic-support';

import { assign } from 'ember-cli-d3/utils/d3';

export default Ember.Component.extend(GraphicSupport(), {

  // required params
  scale: null,

  // optional params
  ticks: null,
  tickSize: null,
  tickFormat: null,
  tickPadding: null,

  axis: Ember.computed('scale', 'orient', 'ticks', 'tickSize', 'tickFormat', 'tickPadding', {
    get() {
      const props = this.getProperties('scale', 'orient', 'ticks', 'tickSize', 'tickFormat', 'tickPadding');

      return props.scale && assign(d3.svg.axis(), props);
    }
  }).readOnly(),

  call(sel) {
    this._super.apply(this, arguments);

    const axis = this.get('axis');

    if (axis) {
      sel.attr('id', this.elementId)
        .call(axis)
        .each(function () {
          d3.select(this).selectAll('.tick')
            .classed('zero', (data) => !data);
        });
    }
  },
});
