import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import equalProps from 'linx/lib/computed/equal-props';
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
  prevTransitionIsMatch: equalProps('prevTransition.toTrack.content', 'transition.fromTrack.content'),
  nextTransition: Ember.computed.reads('nextItem.transition'),
  nextTransitionIsMatch: equalProps('transition.toTrack.content', 'nextTransition.fromTrack.content'),

  transitionClip: Ember.computed('transition', function() {
    return this.get('store').createRecord('transition-clip', {
      transition: this.get('transition'),
      mixItem: this,
    });
  }),

  fromTrackClip: Ember.computed('fromTrack.content', function() {
    let fromTrack = this.get('fromTrack.content');
    return this.get('store').createRecord('track-clip', {
      model: fromTrack,
      mixItem: this,
    });
  }),

  // share with nextItem, if matches
  toTrackClip: variableTernary('nextTransitionIsMatch', 'nextItem.fromTrackClip', '_toTrackClip'),
  _toTrackClip: Ember.computed('toTrack.content', function() {
    let toTrack = this.get('toTrack.content');
    return this.get('store').createRecord('track-clip', {
      model: toTrack,
      mixItem: this,
    });
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
        transition.setFromTrackEndBeat(fromTrack.get('audioMeta.endBeat')),
        transition.setToTrackStartBeat(toTrack.get('audioMeta.startBeat')),
        transition.get('arrangement').then((arrangement) => {
          let automationClip = this.get('store').createRecord('automation-clip', {
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
