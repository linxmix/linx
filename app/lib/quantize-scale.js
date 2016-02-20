import Ember from 'ember';
import d3 from 'd3';

import CurveMixin from 'linx/mixins/curve';
import RequireAttributes from 'linx/lib/require-attributes';

// Wrapper for d3.scale.quantize
export default Ember.Object.extend(CurveMixin,
  RequireAttributes('domain', 'range'), {

  getPoint(x) {
    return this.get('scale')(x);
  },

  getPoints(arr = []) {
    return arr.map((x) => {
      return this.getPoint(x);
    });
  },

  getInverseExtent(y) {
    return this.get('scale').invertExtent(y);
  },

  getInverseExtents(arr) {
    return arr.map((y) => {
      return this.getInverse(y);
    });
  },

  scale: Ember.computed('domain', 'range', function() {
    return d3.scale.linear().domain(this.get('domain')).rangeRound(this.get('range'));
  }).readOnly(),
});
