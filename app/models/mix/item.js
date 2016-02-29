import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import TrackClip from './track-clip';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import computedObject from 'linx/lib/computed/object';
import { variableTernary } from 'linx/lib/computed/ternary';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend(
  OrderedHasManyItemMixin('mix'),
  DependentRelationshipMixin('transitionClip'),
  DependentRelationshipMixin('fromTrackClip'), {

  mix: DS.belongsTo('mix', { async: true }),

  fromTrack: Ember.computed.alias('transition.fromTrack'),
  toTrack: Ember.computed.alias('transition.toTrack'),

  _transitionClip: DS.belongsTo('mix/transition-clip', { async: true }),
  transitionClip: withDefaultModel('_transitionClip', function() {
    return this.get('store').createRecord('mix/transition-clip', {
      mixItem: this,
    });
  }),

  _trackClip: DS.belongsTo('mix/track-clip', { async: true }),
  trackClip: withDefaultModel('_trackClip', function() {
    return this.get('store').createRecord('mix/track-clip', {
      mixItem: this,
    });
  }),

  fromTrackClip: computedObject(TrackClip, {
    'track': 'fromTrack.content',
    'arrangement': 'mix.content',
    'fromTransitionClip': 'prevTransitionClip',
    'toTransitionClip': 'transitionClip',
    'automations': 'transition.fromTrackAutomations',
  }),

  // share with nextItem, if matches
  toTrackClip: variableTernary('nextTransitionIsMatch', 'nextItem.fromTrackClip', '_toTrackClip'),
  _toTrackClip: computedObject(TrackClip, {
    'track': 'toTrack.content',
    'arrangement': 'mix.content',
    'fromTransitionClip': 'transitionClip',
    'toTransitionClip': 'nextTransitionClip',
    'automations': 'transition.toTrackAutomations',
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
