import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import TrackClip from './track-clip';
import TransitionClip from './transition-clip';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import equalProps from 'linx/lib/computed/equal-props';
import computedObject from 'linx/lib/computed/object';
import { variableTernary } from 'linx/lib/computed/ternary';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend(
  OrderedHasManyItemMixin('mix'),
  DependentRelationshipMixin('transition'), {

  mix: DS.belongsTo('mix', { async: true }),
  _transition: DS.belongsTo('transition', { async: true }),
  transition: withDefaultModel('_transition', function() {
    // TODO(FIREBASE): have to fake title for Firebase to accept record
    let transition = this.get('store').createRecord('transition', {
      title: 'test title'
    });
    return transition;
  }),

  fromTrack: Ember.computed.alias('transition.fromTrack'),
  toTrack: Ember.computed.alias('transition.toTrack'),
  hasValidTransition: Ember.computed.reads('transitionClip.isValid'),

  prevTransition: Ember.computed.reads('prevItem.transition'),
  prevTransitionClip: Ember.computed.reads('prevItem.transitionClip'),
  prevTransitionIsMatch: equalProps('prevTransition.toTrack.content', 'transition.fromTrack.content'),

  nextTransition: Ember.computed.reads('nextItem.transition'),
  nextTransitionClip: Ember.computed.reads('nextItem.transitionClip'),
  nextTransitionIsMatch: equalProps('transition.toTrack.content', 'nextTransition.fromTrack.content'),

  transitionClip: computedObject(TransitionClip, {
    'mixItem': 'this',
  }),

  fromTrackClip: computedObject(TrackClip, {
    'track': 'fromTrack.content',
    'arrangement': 'mix.content',
    'fromTransitionClip': 'prevTransitionClip',
    'toTransitionClip': 'transitionClip',
  }),

  // share with nextItem, if matches
  toTrackClip: variableTernary('nextTransitionIsMatch', 'nextItem.fromTrackClip', '_toTrackClip'),
  _toTrackClip: computedObject(TrackClip, {
    'track': 'toTrack.content',
    'arrangement': 'mix.content',
    'fromTransitionClip': 'transitionClip',
    'toTransitionClip': 'nextTransitionClip',
  }),

  // optimizes transition within this mix
  optimizeTransition(options = {}) {
    return this.get('listReadyPromise').then(() => {
      let { prevTransition, nextTransition } = this.getProperties('prevTransition', 'nextTransition');

      // add default constraints to options
      options = _.defaults({}, options, {
        fromTrack: prevTransition && prevTransition.get('toTrack'),
        toTrack: nextTransition && nextTransition.get('fromTrack'),

        minFromTrackEndBeat: prevTransition && prevTransition.get('toTrackStartBeat'),
        maxToTrackStartBeat: nextTransition && nextTransition.get('fromTrackEndBeat'),
      });

      return this.get('transition').then((transition) => {
        return transition.optimize(options);
      });
    });
  },
});
