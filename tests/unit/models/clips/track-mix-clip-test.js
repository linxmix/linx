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
      startBeat() { return trackMixClip.get('startBeatWithoutTransition'); },
      endBeat() { return trackMixClip.get('endBeatWithoutTransition'); },
    });
  });

  describe('with valid prevTransition', function() {
    let prevEvent, prevTransition, trackMixClip;

    beforeEach(function() {
      let results = makeTransitionMixEvent.call(this);
      prevEvent = results.transitionMixEvent;
      prevTransition = results.transition;
      trackMixClip = results.toTrackMixClip;
    });

    it('prevEvent is valid transition', function() {
      expect(prevEvent.get('isValidTransition')).to.be.true;
    });

    describeAttrs('trackMixClip', {
      subject() { return trackMixClip; },
      prevEvent() { return prevEvent; },
      'prevTransition.content': () => prevTransition,
      startBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      startBeat() { return trackMixClip.get('startBeatWithTransition'); },
      endBeat() { return trackMixClip.get('endBeatWithoutTransition'); },
    });
  });

  describe('with valid nextTransition', function() {
    let nextEvent, nextTransition, trackMixClip;

    beforeEach(function() {
      let results = makeTransitionMixEvent.call(this);
      nextEvent = results.transitionMixEvent;
      nextTransition = results.transition;
      trackMixClip = results.fromTrackMixClip;
    });

    it('nextEvent is valid transition', function() {
      expect(nextEvent.get('isValidTransition')).to.be.true;
    });

    describeAttrs('trackMixClip', {
      subject() { return trackMixClip; },
      nextEvent() { return nextEvent; },
      'nextTransition.content': () => nextTransition,
      endBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      startBeat() { return trackMixClip.get('startBeatWithoutTransition'); },
      endBeat() { return trackMixClip.get('endBeatWithTransition'); },
    });
  });

  describe('with valid transitions', function() {
    let prevEvent, prevTransition, nextEvent, nextTransition, track, trackMixClip, trackMixEvent;

    beforeEach(function() {

      // setup prevEvent
      let prevResults = makeTransitionMixEvent.call(this);
      prevEvent = prevResults.transitionMixEvent;
      prevTransition = prevResults.transition;
      trackMixClip = prevResults.toTrackMixClip;
      trackMixEvent = prevResults.toTrackMixEvent;
      track = prevResults.toTrack;

      // setup nextEvent
      let nextResults = makeTransitionMixEvent.call(this);
      nextEvent = nextResults.transitionMixEvent;
      nextTransition = nextResults.transition;

      nextTransition.set('fromTrack', track);
      nextEvent.set('prevEvent', trackMixEvent);
      trackMixEvent.set('nextEvent', nextEvent);
    });

    it('prevEvent is valid transition', function() {
      expect(prevEvent.get('isValidTransition')).to.be.true;
    });

    it('nextEvent is valid transition', function() {
      expect(nextEvent.get('isValidTransition')).to.be.true;
    });

    describeAttrs('trackMixClip', {
      subject() { return trackMixClip; },
      prevEvent() { return prevEvent; },
      nextEvent() { return nextEvent; },
      'prevTransition.content': () => prevTransition,
      'nextTransition.content': () => nextTransition,
      startBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      endBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      startBeat() { return trackMixClip.get('startBeatWithTransition'); },
      endBeat() { return trackMixClip.get('endBeatWithTransition'); },
    });
  });
});
