import Ember from 'ember';

// Interface for Curves
export default Ember.Mixin.create({
  getPoint(x) {
    throw new Error('curve.getPoint(x) unimplemented', this);
  },

  getPoints(arr) {
    throw new Error('curve.getPoints(arr) unimplemented', this);
  },

  toString() {
    return '<linx@mixin:curve>';
  },
});
