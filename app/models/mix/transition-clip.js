import Ember from 'ember';
import DS from 'ember-data';

import Clip from '../arrangement/clip';

import subtract from 'linx/lib/computed/subtract';
import { propertyOrDefault } from 'linx/lib/computed/ternary';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default Clip.extend({

  mixItem: DS.belongsTo('mix/item'),
  fromTrackClip: Ember.computed.reads('mixItem.trackClip'),
  toTrackClip: Ember.computed.reads('mixItem.nextTrackClip'),

  _transition: DS.belongsTo('mix/transition'),
  transition: withDefaultModel('_transition', function() {
    // TODO(FIREBASE): have to fake title for Firebase to accept record
    const transition = this.get('store').createRecord('mix/transition', {
      title: 'test title',
      transitionClip: this,
    });
    return transition;
  }),

  // implementing Clip
  _startBeat: subtract('fromTrackClip.endBeat', 'beatCount'), // overlap
  startBeat: propertyOrDefault('isReadyAndValid', '_startBeat', 0),
  arrangement: Ember.computed.reads('mixItem.mix'),
  beatCount: Ember.computed.reads('transition.beatCount'),
});
