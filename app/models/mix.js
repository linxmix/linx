import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { flatten, asResolvedPromise } from 'linx/lib/utils';
import add from 'linx/lib/computed/add';

export default DS.Model.extend(
  DependentRelationshipMixin('arrangement'),
  OrderedHasManyMixin({ itemModelName: 'mix-item', itemsPath: 'items' }), {

  title: DS.attr('string'),
  items: DS.hasMany('mix-item', { async: true, defaultValue: () => [] }),

  // TODO(CLEANUP): destroy arrangement when destroying mix?
  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    let arrangement = this.get('store').createRecord('arrangement');
    arrangement.get('mixes').addObject(this);
    return arrangement;
  }),

  trackItems: Ember.computed.filterBy('items', 'isTrack'),
  tracks: Ember.computed.mapBy('trackItems', 'model'),

  transitionItems: Ember.computed.filterBy('items', 'isTransition'),
  transitions: Ember.computed.mapBy('transitionItems', 'model'),

  mixItems: Ember.computed.filterBy('items', 'isMix'),
  mixes: Ember.computed.mapBy('mixItems', 'model'),

  // appends model as an item, returns a promise which resolves into the item
  appendTrack: appendModelFn(),
  appendTransition: appendModelFn(),
  appendMix: appendModelFn(),

  // adds matching tracks when appending given transition
  appendTransitionWithTracks: function(transition) {
    return this.appendTransition(transition).then((transitionMixEvent) => {
      let promises = [];

      // append tracks if not already present
      // TODO(TRANSITION)
      if (!transitionMixEvent.get('fromTrackIsValid')) {
        // promises.append(this.appendTrack())
      }

      if (!transitionMixEvent.get('toTrackIsValid')) {
        // promises.append(this.appendTrack())
      }

      return Ember.RSVP.all(promises).then(() => {
        return transitionMixEvent;
      });
    });

    var index = this.get('length');
    var prevEvent = this.trackAt(index - 1);
    var promises = [];

    var fromTrack = transition.get('fromTrack');
    var toTrack = transition.get('toTrack');

    // if prevTrack matches fromTrack, use it
    if (prevTrack && prevTrack.get('id') === fromTrack.get('id')) {
      index -= 1;

    // otherwise, just add fromTrack
    } else {
      promises.push(this.insertTrackAt(index, fromTrack));
    }

    // then add transition and toTrack
    promises.push(this.insertTransitionAt(index, transition));
    promises.push(this.insertTrackAt(index + 1, toTrack));

    return Ember.RSVP.all(promises);
  },
});

function appendModelFn() {
  return function(model) {
    return this.createAndAppend().setModel(model);
  };
};
