import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';
import makeTrackMixEvent from 'linx/tests/helpers/make-track-mix-event';
import makeTransitionMixEvent from 'linx/tests/helpers/make-transition-mix-event';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('TrackMixClip', function() {
  setupUnitTest();

  describe('without transitions', function() {
    let track, trackMixClip, trackMixEvent;

    beforeEach(function() {
      let results = makeTrackMixEvent.call(this);
      track = results.track;
      trackMixClip = results.trackMixClip;
      trackMixEvent = results.trackMixEvent;
    });

    describeAttrs('trackMixClip', {
      subject() { return trackMixClip; },
      startBeatWithoutTransition() { return track.get('audioMeta.firstBeat'); },
      endBeatWithoutTransition() { return track.get('audioMeta.lastBeat'); },
      startBeat() { return trackMixClip.get('startBeat'); },
      endBeat() { return trackMixClip.get('endBeat'); },
    });
  });

  // TODO(TEST)
  describe.skip('with valid prevTransition', function() {
  });
  describe.skip('with valid nextTransition', function() {
  });
  describe.skip('with valid transitions', function() {
  });
});
