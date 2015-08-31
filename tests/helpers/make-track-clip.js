import Ember from 'ember';
import DS from 'ember-data';

import makeTrack from 'linx/tests/helpers/make-track';

// creates track-event with specifications
export default function(options = {}) {
  let track = Ember.getWithDefault(options, 'track', makeTrack.call(this, options));

  let trackClip = this.factory.make('track-clip', {
    track: track,
  });

  return {
    track,
    trackClip,
  };
}
