import Ember from 'ember';
import d3 from 'd3';

import GraphicSupport from 'linx/mixins/d3/graphic-support';

import { assign } from 'ember-cli-d3/utils/d3';

export default Ember.Component.extend(GraphicSupport(), {
  transform: null,

  ticks: null,
  tickSize: null,
  tickFormat: null,
  tickPadding: null,

  scale: null,

  axis: Ember.computed('scale', 'orient', 'ticks', 'tickSize', 'tickFormat', 'tickPadding', {
    get() {
      var props = this.getProperties('scale', 'orient', 'ticks', 'tickSize', 'tickFormat', 'tickPadding');

      return props.scale && assign(d3.svg.axis(), props);
    }
  }).readOnly(),

  call(sel) {
    var axis = this.get('axis');
    var transform = this.get('transform');

    if (axis) {
      sel.attr('id', this.elementId)
        .attr('transform', transform)
        .call(axis)
        .each(function () {
          d3.select(this).selectAll('.tick')
            .classed('zero', (data) => !data);
        });
    }
  },
});
