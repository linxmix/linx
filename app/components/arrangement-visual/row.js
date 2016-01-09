import Ember from 'ember';

import GraphicSupport from 'ember-cli-d3/mixins/d3-support';

export default Ember.Component.extend(GraphicSupport, {
  // classNames: ['ArrangementVisualRow'],
  // classNameBindings: ['isMini:ArrangementVisualRow--mini'],

  // optional params
  model: null,
  size: '',

  isMini: Ember.computed.equal('size', 'mini'),

  exportedSelection: Ember.computed('select', function() {
    console.log("exportedSelection", this.get('elementId'));
    return this.get(`select.${this.get('elementId')}`);
  }),

  call(selection) {
    selection.classed('ArrangementVisualRow', true)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 50)
      .style("fill", "#B8DEE6")

    selection.append("circle")
      .attr("cx", this.get('maxX'))
      .attr("cy", 0)
      .attr("r", 50)
      .style("fill", "#B8DE44")

    console.log("ROW CALL", this.get('elementId'));
  },
});
