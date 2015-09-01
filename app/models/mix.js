import Ember from 'ember';
import DS from 'ember-data';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { flatten, asResolvedPromise } from 'linx/lib/utils';
import add from 'linx/lib/computed/add';

export default DS.Model.extend({
  type: 'mix',

  items: Ember.computed.alias('arrangement.items'),

  title: DS.attr('string'),
  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    let arrangement = this.get('store').createRecord('arrangement');
    arrangement.get('mixes').addObject(this);
    return arrangement;
  }),

  // TODO(DEPENDENTMODEL)
  save() {
    let promises = [
      this._super.apply(this, arguments),
    ];

    this.get('arrangement').then((arrangement) => {
      return arrangement.save();
    }),

    console.log('save mix', promises);

    return Ember.RSVP.all(promises).then(() => {
      console.log('save mix then');
      return this;
    });
  },

  // TODO(DEPENDENTMODEL)
  anyDirty: function() {
    return this._super.apply(this, arguments) || this.get('arrangement.anyDirty');
  }.property('isDirty', 'arrangement.anyDirty'),

  length: Ember.computed.reads('items.length'),

  // tracks: function() {
  //   return flatten(this.get('arrangement.clips').mapBy('tracks') || []);
  // }.property('arrangement.clips.@each.tracks'),
  trackItems: Ember.computed.filterBy('items', 'type', 'track-clip'),
  tracks: Ember.computed.mapBy('trackItems', 'track'),

  transitionItems: Ember.computed.filterBy('items', 'type', 'transition-clip'),
  transitions: Ember.computed.mapBy('transitionItems', 'transition'),

  mixItems: Ember.computed.filterBy('items', 'type', 'mix-clip'),
  mixes: Ember.computed.mapBy('mixItems', 'mix'),

  itemAt(index) {
    return this.get('items').objectAt(index);
  },

  removeItem(item) {
    return this.get('items').removeObject(item);
  },

  // appends model as an event, returns a promise which resolves into the event
  appendTrack: appendModelFn('track'),
  appendTransition: appendModelFn('transition'),
  appendMix: appendModelFn('mix'),

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

// returns a function which appends a clip with given model to the arrangement
function appendModelFn(modelName) {
  let clipModelName = `${modelName}-clip`;

  return function(model) {
    let clipParams = { modelName: clipModelName };
    clipParams[modelName] = model;


    let clip = this.get('store').createRecord(clipModelName, clipParams);
    console.log("created clip", clipParams, clip)

    // clip.save().then(() => {
      this.get('arrangement.content').appendItem(clip);
    // });

    return clip;
  };
};
