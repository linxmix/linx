import Ember from 'ember';

// TODO(RONHACK)
export function add([ a, b ]) {
  return (Number(a) || 0) + (Number(b) || 0);
}

export default Ember.Helper.helper(add);
