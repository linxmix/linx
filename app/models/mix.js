import Ember from 'ember';
import DS from 'ember-data';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { flatten, getContent } from 'linx/lib/utils';
import add from 'linx/lib/computed/add';

export default DS.Model.extend({
  type: 'mix',

  title: DS.attr('string'),
  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    return this.get('store').createRecord('arrangement');
  }),

  length: Ember.computed.reads('arrangement.clips.length'),

  // tracks: function() {
  //   return flatten(this.get('arrangement.clips').mapBy('tracks') || []);
  // }.property('arrangement.clips.@each.tracks'),
  trackClips: Ember.computed.filterBy('arrangement.clips', 'type', 'track-clip'),
  tracks: Ember.computed.mapBy('trackClips', 'track'),

  transitionClips: Ember.computed.filterBy('arrangement.clips', 'type', 'transition-clip'),
  transitions: Ember.computed.mapBy('transitionClips', 'transition'),

  mixClips: Ember.computed.filterBy('arrangement.clips', 'type', 'mix-clip'),
  mixes: Ember.computed.mapBy('mixClips', 'mix'),

  objectAt(index) {
    return this.get('arrangement.clips').objectAt(index);
  },

  removeObject(object) {
    return this.get('arrangement.clips').removeObject(object);
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

    return this.get('arrangement.content').appendItem(clipParams);
  };
};
