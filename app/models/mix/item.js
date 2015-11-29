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

export default DS.Model.extend(
  OrderedHasManyItemMixin('mix'),
  DependentRelationshipMixin('transition'), {

  mix: DS.belongsTo('mix', { async: true }),
  transition: DS.belongsTo('transition', { async: true }),

  fromTrack: Ember.computed.reads('transition.fromTrack'),
  toTrack: Ember.computed.reads('transition.toTrack'),
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

  //
  // Transition generation
  //

  assertTransition(options) {
    return this.get('listReadyPromise').then(() => {
      if (this.get('hasValidTransition')) {
        return this.get('transition');
      } else {
        return this.generateTransition(options);
      }
    });
  },

  // generates and returns valid transition, if possible
  generateTransition(options = {}) {
    return this.get('listReadyPromise').then(() => {
      let { prevTransition, nextTransition, hasValidTransition } = this.getProperties('prevTransition', 'nextTransition', 'hasValidTransition');

      // add default constraints to options
      options = _.defaults({}, options, {
        fromTrack: prevTransition && prevTransition.get('toTrack'),
        toTrack: nextTransition && nextTransition.get('fromTrack'),

        minFromTrackEndBeat: prevTransition && prevTransition.get('toTrackStartBeat'),
        maxToTrackStartBeat: nextTransition && nextTransition.get('fromTrackEndBeat'),
      });

      if (hasValidTransition) {
        console.log("generateTransition: replacing a valid transition", this.get('transition'));
      }

      return this._generateTransition(options).then((transition) => {
        this.set('transition', transition);
        return transition;
      });
    });
  },

  // returns a new transition model between two given tracks, with options
  _generateTransition(options = {}) {
    let { fromTrack, toTrack } = options;

    Ember.assert('Must have fromTrack and toTrack to generateTransition', Ember.isPresent(fromTrack) && Ember.isPresent(toTrack));

    console.log("_generateTransition", fromTrack, toTrack);

    return Ember.RSVP.all([
      this.get('readyPromise'),
      fromTrack.get('readyPromise'),
      toTrack.get('readyPromise'),
    ]).then(() => {

      let {
        preset,
        minFromTrackEndBeat,
        maxToTrackStartBeat,
        fromTrackEnd,
        toTrackStart,
      } = options;

      // TODO(TRANSITION): improve this algorithm, add options and presets
      let transition = this.get('store').createRecord('transition', {
        fromTrack,
        toTrack,
      });

      return Ember.RSVP.all([
        // TODO(REFACTOR): this should ideally be first and last quantized bar
        transition.setFromTrackEndBeat(Math.round(fromTrack.get('audioMeta.endBeat'))),
        transition.setToTrackStartBeat(Math.round(toTrack.get('audioMeta.startBeat'))),
        transition.get('arrangement').then((arrangement) => {
          let automationClip = this.get('store').createRecord('arrangement/automation-clip', {
            numBeats: 16,
          });
          arrangement.get('automationClips').addObject(automationClip);
          return arrangement.save().then(() => {
            return automationClip.save();
          });
        })
      ]).then(() => {
        return transition;
      });
    });
  },

});
