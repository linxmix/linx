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
  DependentRelationshipMixin('trackClip'), {

  mix: DS.belongsTo('mix', { async: true }),

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

  setTrack(track) {
    return this.get('trackClip').then((trackClip) => {
      trackClip.set('track', track);
      return this;
    });
  },

  track: Ember.computed.reads('trackClip.track'),
  transition: Ember.computed.reads('transitionClip.transition'),

  prevTransition: Ember.computed.reads('prevTransitionClip.transition'),
  nextTransition: Ember.computed.reads('nextTransitionClip.transition'),

  prevTransitionClip: Ember.computed.reads('prevItem.transitionClip'),
  nextTransitionClip: Ember.computed.reads('nextItem.transitionClip'),

  prevTrackClip: Ember.computed.reads('prevItem.trackClip'),
  nextTrackClip: Ember.computed.reads('nextItem.trackClip'),
});
