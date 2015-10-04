import Ember from 'ember';

export function svgTransition([ sel ], hash) {
  return Ember.tryInvoke(sel, 'transition', [ hash ]) || sel;
}

export default Ember.HTMLBars.makeBoundHelper(svgTransition);
