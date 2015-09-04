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

import asResolvedPromise from 'linx/lib/utils';

describe('TrackClipModel', function() {
  setupUnitTest();

  let track, trackClip;

  beforeEach(function() {
    let results = makeTrackClip.call(this);
    track = results.track;
    trackClip = results.trackClip;
  });

  describe('persisting attributes', function() {
    it('can persist audioStartBeat', function() {
      Ember.run(function() {
        trackClip.set('audioStartBeat', 3);
        wait(trackClip.save());
      });

      // TODO(DBSTUB): make this actually check payload
      andThen(function() {
        expect(trackClip.get('audioStartBeat')).to.equal(3);
      });
    });

    it('can persist numBeats', function() {
      Ember.run(function() {
        trackClip.set('numBeats', 3);
        wait(trackClip.save());
      });

      // TODO(DBSTUB): make this actually check payload
      andThen(function() {
        expect(trackClip.get('numBeats')).to.equal(3);
      });
    });
  });

  // TODO: refactor into mixable clip behaviours
  describe('without other clips', function() {
    describeAttrs('trackClip', {
      subject() { return trackClip; },
      startBeat: 0,
      numBeats() { return track.get('audioMeta.numBeats'); },
      clipStartBeatWithoutTransition() { return track.get('audioMeta.firstBeat'); },
      clipEndBeatWithoutTransition() { return track.get('audioMeta.lastBeat'); },
      audioStartBeat() { return trackClip.get('clipStartBeatWithoutTransition'); },
      audioEndBeat() { return trackClip.get('clipEndBeatWithoutTransition'); },

      audioStartTime: 0.3190228052297187,
      audioLength: 367.14311391752545,
      audioEndTime: 367.4621367227552,
    });
  });


  describe('with prevClip', function() {
    let prevClip;

    beforeEach(function() {
      let results = makeTrackClip.call(this);
      prevClip = results.trackClip;
      trackClip.set('prevClip', prevClip);
      prevClip.set('nextClip', trackClip);
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      startBeat() { return prevClip.get('endBeat'); },
      numBeats() { return track.get('audioMeta.numBeats'); }
    });
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
      startBeat() { return prevClip.get('startBeat'); },
      numBeats() { return track.get('audioMeta.lastBeat') - prevTransition.get('toTrackStartBeat'); },
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
      startBeat: 0,
      numBeats() { return nextTransition.get('fromTrackEndBeat') - track.get('audioMeta.firstBeat'); },
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
      prevClip.set('startBeat', 30);

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
      startBeat() { return prevClip.get('startBeat'); },
      numBeats() { return nextTransition.get('fromTrackEndBeat') - prevTransition.get('toTrackStartBeat'); },
      clipStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      clipEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      audioStartBeat() { return trackClip.get('clipStartBeatWithTransition'); },
      audioEndBeat() { return trackClip.get('clipEndBeatWithTransition'); },
    });
  });
});
