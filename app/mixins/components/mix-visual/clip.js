import Ember from 'ember';

import equalProps from 'linx/lib/computed/equal-props';
import { variableTernary } from 'linx/lib/computed/ternary';

export default Ember.Mixin.create({

  // required params
  selectedClip: null,
  fullHeight: null,
  rowHeight: null,

  height: variableTernary('isSelected', 'rowHeight', 'fullHeight'),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualClip', true);
  },

  selectedFromTrackClip: Ember.computed.reads('selectedClip.fromTrackClip'),
  selectedToTrackClip: Ember.computed.reads('selectedClip.toTrackClip'),

  isSelectedFromTrackClip: equalProps('selectedFromTrackClip', 'clip'),
  isSelectedToTrackClip: equalProps('selectedToTrackClip', 'clip'),

  isSelectedClip: equalProps('selectedClip.id', 'clip.id'),
  isSelected: Ember.computed.or('isSelectedClip', 'isSelectedFromTrackClip', 'isSelectedToTrackClip'),
});
