import Ember from 'ember';

export function negative([ num ]) {
  return (Number(num) || 0) * -1;
}

export default Ember.HTMLBars.makeBoundHelper(negative);
