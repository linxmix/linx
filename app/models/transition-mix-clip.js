import Ember from 'ember';
import DS from 'ember-data';
import ArrangementClip from './arrangement-clip';

export default ArrangementClip.extend({
  type: 'transition-mix-clip',
  arrangementEvent: DS.belongsTo('transition-mix-event', { async: true }),
  transition: DS.belongsTo('transition', { async: true }),
  arrangement: Ember.computed.reads('transition.arrangement'),

  // TODO(TRANSITION)
  fromClip: Ember.computed.reads('arrangementEvent.prevClip'),
  toClip: Ember.computed.reads('arrangementEvent.nextClip'),
});
