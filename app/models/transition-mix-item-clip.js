import Ember from 'ember';
import DS from 'ember-data';
import ArrangementClip from './arrangement-clip';

export default ArrangementClip.extend({
  type: 'transition-mix-item-clip',

  // TODO(TRANSITION)
  arrangement: Ember.computed.reads('arrangementItem.transition.arrangement'),
  fromClip: Ember.computed.reads('arrangementItem.fromClip'),
  toClip: Ember.computed.reads('arrangementItem.toClip'),
});
