import Ember from 'ember';
import DS from 'ember-data';

import makeTrack from 'linx/tests/helpers/make-track';

// creates track-event with specifications
export default function(options = {}) {
  let track = Ember.getWithDefault(options, 'track', makeTrack.call(this, options));

  let trackMixEvent = this.factory.make('track-mix-event');

  // make withDefaultModel think event has clip
  trackMixEvent.set('_data', {
    _clip: 1
  });

  let trackMixClip = this.factory.make('track-mix-clip', {
    track: track,
    arrangementEvent: trackMixEvent,
  });

  return {
    track,
    trackMixClip,
    trackMixEvent,
  };
}
