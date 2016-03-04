import Ember from 'ember';
import DS from 'ember-data';

import TrackClip from '../arrangement/track-clip';
import withDefault from 'linx/lib/computed/with-default';

export default TrackClip.extend({

  mixItem: DS.belongsTo('mix/item'),
  automationClips: DS.hasMany('mix/transition/automation-clip'),

  arrangement: Ember.computed.reads('mixItem.mix'),
  startBeat: withDefault('mixItem.prevTransitionClip.startBeat', 0),
});
