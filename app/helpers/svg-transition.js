// TODO(CLEANUP): does this do anything?
import Ember from 'ember';

export function svgTransition([ sel ], hash) {
  return Ember.tryInvoke(sel, 'transition', [ hash ]) || sel;
}

export default Ember.Helper.helper(svgTransition);
