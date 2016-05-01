import Ember from 'ember';

import GraphicSupport from 'linx/mixins/d3/graphic-support';

export default Ember.Component.extend(GraphicSupport(), {
  // classNames: ['ArrangementVisualRow'],
  // classNameBindings: ['isMini:ArrangementVisualRow--mini'],

  // optional params
  model: null,
  size: '',

  isMini: Ember.computed.equal('size', 'mini'),

  exportedSelection: Ember.computed('select', function() {
    Ember.Logger.log("exportedSelection", this.get('elementId'));
    return this.get(`select.${this.get('elementId')}`);
  }),

  call(selection) {
    this._super.apply(this, arguments);

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

    Ember.Logger.log("ROW CALL", this.get('elementId'));
  },
});
