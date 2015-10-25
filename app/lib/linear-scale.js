import Ember from 'ember-data';
import d3 from 'd3';

import CurveMixin from 'linx/mixins/models/curve';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Object.create(CurveMixin,
  RequireAttributes('domain', 'range'), {

  getPoint(x) {
    return this.get('scale')(x);
  },

  getPoints(arr = []) {
    return arr.map((x) => {
      return this.getPoint(x);
    });
  },

  getInverse(y) {
    return this.get('scale').invert(y);
  },

  getInverses(arr) {
    return arr.map((y) => {
      return this.getInverse(y);
    });
  },

  scale: Ember.computed('domain', 'range', function() {
    return d3.scale.linear().domain(this.get('domain')).range(this.get('range'));
  });
});
