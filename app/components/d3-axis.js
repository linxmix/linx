import Ember from 'ember';
import d3 from 'd3';

import GraphicSupport from 'ember-cli-d3/mixins/d3-support';

import { assign } from 'ember-cli-d3/utils/d3';

export default Ember.Component.extend(GraphicSupport, {
  classNames: ['D3Axis'],
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
