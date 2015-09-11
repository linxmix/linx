import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import makeTrack from 'linx/tests/helpers/make-track';
import makeMix from 'linx/tests/helpers/make-mix';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('MixModel#generateTransitionFromTracks', function() {
  setupTestEnvironment();

  let mix, arrangement;
  let fromTrack, toTrack, transition;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = this.mix = results.mix;
    arrangement = this.arrangement = results.arrangement;

    fromTrack = makeTrack.call(this);
    toTrack = makeTrack.call(this);
  });

  describe('without options', function() {
    beforeEach(function() {
      Ember.run(() => {
        wait(mix.generateTransitionFromTracks(fromTrack, toTrack).then((_transition) => {
          transition = _transition;
        }));
      });
    });

    describeAttrs('transition', {
      subject() { return transition; },
      'fromTrack.content': () => fromTrack,
      'toTrack.content': () => toTrack,
      fromTrackEnd() { return fromTrack.get('audioMeta.lastBeatMarker.start'); },
      toTrackStart() { return toTrack.get('audioMeta.firstBeatMarker.start'); },
    });
  });
});
