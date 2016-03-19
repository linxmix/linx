import Ember from 'ember';
import DS from 'ember-data';

import Clip from '../arrangement/clip';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import subtract from 'linx/lib/computed/subtract';
import withDefaultModel from 'linx/lib/computed/with-default-model';
import { isValidNumber } from 'linx/lib/utils';

export default Clip.extend(
  DependentRelationshipMixin('transition'), {

  mixItem: DS.belongsTo('mix/item'),
  fromTrackClip: Ember.computed.reads('mixItem.trackClip'),
  toTrackClip: Ember.computed.reads('mixItem.nextTrackClip'),

  prevTransitionClip: Ember.computed.reads('mixItem.prevTransitionClip'),
  nextTransitionClip: Ember.computed.reads('mixItem.nextTransitionClip'),

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
  startBeat: subtract('fromTrackClip.endBeat', 'beatCount'), // overlap
  mix: Ember.computed.reads('mixItem.mix'),
  arrangement: Ember.computed.reads('mix'),
  beatCount: Ember.computed.reads('transition.beatCount'),

  // min and max start and end beat, based on adjacent transitions
  minStartBeat: Ember.computed('prevTransitionClip.endBeat', 'fromTrackClip.startBeat', function() {
    const prevTransitionClipEndBeat = this.get('prevTransitionClip.endBeat');
    return isValidNumber(prevTransitionClipEndBeat) ? prevTransitionClipEndBeat : this.get('fromTrackClip.startBeat');
  }),
  maxEndBeat: Ember.computed('nextTransitionClip.startBeat', 'toTrackClip.endBeat', function() {
    const nextTransitionClipStartBeat = this.get('nextTransitionClip.startBeat');
    return isValidNumber(nextTransitionClipStartBeat) ? nextTransitionClipStartBeat : this.get('toTrackClip.endBeat');
  }),

  startTransition: Ember.on('schedule', function() {
    const currentBeat = this.getCurrentMetronomeBeat() - this.get('startBeat');
    const transition = this.get('transition.content');

    transition && transition.play(currentBeat);
  }),

  stopTransition: Ember.on('unschedule', function() {
    const transition = this.get('transition.content');

    transition && transition.pause();
  }),
});
