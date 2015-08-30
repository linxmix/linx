import Ember from 'ember';
import DS from 'ember-data';

import Arrangement from './arrangement';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import { flatten } from 'linx/lib/utils';
import add from 'linx/lib/computed/add';

export default Arrangement.extend({
  type: 'mix',

  title: DS.attr('string'),
  validEvents: Ember.computed.filterBy('events', 'isValid', true),

  // params
  tracks: function() {
    return flatten(this.get('events').mapBy('tracks'));
  }.property('events.@each.tracks'),
  transitions: Ember.computed.filterBy('events', 'transition.content'),

  numTracks: Ember.computed.reads('tracks.length'),
  numTransitions: Ember.computed.reads('transitions.length'),

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

// returns a function which creates model as an event, then returns a promise which resolves into the event
function appendModelFn(type) {
  let modelName = `${type}-mix-event`;

  return function(model) {
    let mixEvent = this.appendItem({ modelName });

    return mixEvent.save().then(() => {
      return mixEvent.setModel(model).then(() => {
        return mixEvent;
      });
    });
  }
};
