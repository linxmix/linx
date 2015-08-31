import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

import makeTrackClip from 'linx/tests/helpers/make-track-clip';
import makeTransitionClip from 'linx/tests/helpers/make-transition-clip';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('TrackClipModel', function() {
  setupUnitTest();

  // TODO(TEST): test startBeat, numBeats

  let track, trackClip;

  beforeEach(function() {
    let results = makeTrackClip.call(this);
    track = results.track;
    trackClip = results.trackClip;
  });

  describe('without transitions', function() {
    describeAttrs('trackClip', {
      subject() { return trackClip; },
      clipStartBeatWithoutTransition() { return track.get('audioMeta.firstBeat'); },
      clipEndBeatWithoutTransition() { return track.get('audioMeta.lastBeat'); },
      audioStartBeat() { return trackClip.get('clipStartBeatWithoutTransition'); },
      audioEndBeat() { return trackClip.get('clipEndBeatWithoutTransition'); },
    });

    describe.skip('can persist clipStartBeat and clipEndBeat', function() {});
  });

  describe('with valid prevTransition', function() {
    let prevClip, prevTransition;

    beforeEach(function() {
      let results = makeTransitionClip.call(this, { toTrackClip: trackClip });
      prevClip = results.transitionClip;
      prevTransition = results.transition;
    });

    it('prevClip is valid transition', function() {
      expect(prevClip.get('isValidTransition')).to.be.true;
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      prevClip() { return prevClip; },
      'prevTransition.content': () => prevTransition,
      clipStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      audioStartBeat() { return trackClip.get('clipStartBeatWithTransition'); },
      audioEndBeat() { return trackClip.get('clipEndBeatWithoutTransition'); },
    });
  });

  describe('with valid nextTransition', function() {
    let nextClip, nextTransition;

    beforeEach(function() {
      let results = makeTransitionClip.call(this, { fromTrackClip: trackClip });
      nextClip = results.transitionClip;
      nextTransition = results.transition;
    });

    it('nextClip is valid transition', function() {
      expect(nextClip.get('isValidTransition')).to.be.true;
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      nextClip() { return nextClip; },
      'nextTransition.content': () => nextTransition,
      clipEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      audioStartBeat() { return trackClip.get('clipStartBeatWithoutTransition'); },
      audioEndBeat() { return trackClip.get('clipEndBeatWithTransition'); },
    });
  });

  describe('with valid transitions', function() {
    let prevClip, prevTransition, nextClip, nextTransition;

    beforeEach(function() {

      // setup prevClip
      let prevResults = makeTransitionClip.call(this, { toTrackClip: trackClip });
      prevClip = prevResults.transitionClip;
      prevTransition = prevResults.transition;
      prevClip.set('nextClip', trackClip);

      // setup nextClip
      let nextResults = makeTransitionClip.call(this, { fromTrackClip: trackClip });
      nextClip = nextResults.transitionClip;
      nextTransition = nextResults.transition;
      nextClip.set('prevClip', trackClip);

      // setup transition
      prevTransition.set('toTrack', track);
      nextTransition.set('fromTrack', track);
      trackClip.setProperties({ prevClip, nextClip });
    });

    it('prevClip is valid transition', function() {
      expect(prevClip.get('isValidTransition')).to.be.true;
    });

    it('nextClip is valid transition', function() {
      expect(nextClip.get('isValidTransition')).to.be.true;
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      prevClip() { return prevClip; },
      nextClip() { return nextClip; },
      'prevTransition.content': () => prevTransition,
      'nextTransition.content': () => nextTransition,
      clipStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      clipEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      audioStartBeat() { return trackClip.get('clipStartBeatWithTransition'); },
      audioEndBeat() { return trackClip.get('clipEndBeatWithTransition'); },
    });
  });
});
