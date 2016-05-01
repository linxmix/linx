import Ember from 'ember';

import equalProps from 'linx/lib/computed/equal-props';
import { variableTernary } from 'linx/lib/computed/ternary';

export default Ember.Mixin.create({

  // required params
  selectedTransition: null,
  fullHeight: null,
  rowHeight: null,

  // params
  selectedTransitionClip: Ember.computed.reads('selectedTransition.transitionClip'),
  height: variableTernary('isInSelectedTransition', 'rowHeight', 'fullHeight'),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualClip', true);
  },

  selectedFromTrackClip: Ember.computed.reads('selectedTransitionClip.fromTrackClip'),
  selectedToTrackClip: Ember.computed.reads('selectedTransitionClip.toTrackClip'),

  isSelectedFromTrackClip: equalProps('selectedFromTrackClip', 'clip'),
  isSelectedToTrackClip: equalProps('selectedToTrackClip', 'clip'),

  isSelectedTransitionClip: equalProps('selectedTransitionClip.id', 'clip.id'),
  isInSelectedTransition: Ember.computed.or('isSelectedTransitionClip', 'isSelectedFromTrackClip', 'isSelectedToTrackClip'),
  isInSelectedTransition: Ember.computed.or('isSelectedTransitionClip', 'isSelectedFromTrackClip', 'isSelectedToTrackClip'),
});
