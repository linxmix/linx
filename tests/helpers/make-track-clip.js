import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import makeTrack from 'linx/tests/helpers/make-track';

// creates track-event with specifications
export default function(options = {}) {
  let track = Ember.getWithDefault(options, 'track', makeTrack.call(this));

  let trackClip = this.factory.make('track-clip', _.defaults({}, options, {
    model: track,
  }));

  return {
    track,
    trackClip,
  };
}
