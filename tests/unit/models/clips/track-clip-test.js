import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

import makeTrackClip from 'linx/tests/helpers/make-track-clip';
import makeTransitionClip from 'linx/tests/helpers/make-transition-clip';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

import asResolvedPromise from 'linx/lib/utils';

describe('TrackClipModel', function() {
  setupTestEnvironment();

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
      clipStartBeat() { return trackClip.get('clipStartBeatWithoutTransition'); },
      clipEndBeat() { return trackClip.get('clipEndBeatWithoutTransition'); },

      audioStartTime: 0.15951140261485935,
      audioLength: 367.14311391752545,
      audioEndTime: 367.3026253201403,
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
      prevClip = results.fromTrackClip;
      prevTransition = results.transition;

      Ember.run(() => {
        trackClip.setProperties({
          prevTransition,
          prevTransitionIsValid: true
        });
      });
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      prevClip() { return prevClip; },
      startBeat() { return prevClip.get('endBeat') - prevTransition.get('numBeats'); },
      numBeats() { return track.get('audioMeta.lastBeat') - prevTransition.get('toTrackStartBeat'); },
      clipStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      clipStartBeat() { return trackClip.get('clipStartBeatWithTransition'); },
      clipEndBeat() { return trackClip.get('clipEndBeatWithoutTransition'); },
    });
  });

  describe('with valid nextTransition', function() {
    let nextClip, nextTransition;

    beforeEach(function() {
      let results = makeTransitionClip.call(this, { fromTrackClip: trackClip });
      nextClip = results.transitionClip;
      nextTransition = results.transition;

      Ember.run(() => {
        trackClip.setProperties({
          nextTransition,
          nextTransitionIsValid: true
        });
      });
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      startBeat: 0,
      numBeats() { return nextTransition.get('fromTrackEndBeat') - track.get('audioMeta.firstBeat'); },
      clipEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      clipStartBeat() { return trackClip.get('clipStartBeatWithoutTransition'); },
      clipEndBeat() { return trackClip.get('clipEndBeatWithTransition'); },
    });
  });

  describe('with valid transitions', function() {
    let prevClip, prevTransition, nextClip, nextTransition;

    beforeEach(function() {

      Ember.run(() => {
        // setup prevClip
        let prevResults = makeTransitionClip.call(this, { toTrackClip: trackClip });
        prevClip = prevResults.fromTrackClip;
        prevTransition = prevResults.transition;

        // setup nextClip
        let nextResults = makeTransitionClip.call(this, { fromTrackClip: trackClip });
        nextClip = nextResults.toTrackClip;
        nextTransition = nextResults.transition;
      });
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      prevClip() { return prevClip; },
      nextClip() { return nextClip; },
      startBeat() { return prevClip.get('endBeat') - prevTransition.get('numBeats'); },
      numBeats() { return nextTransition.get('fromTrackEndBeat') - prevTransition.get('toTrackStartBeat'); },
      clipStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      clipEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      clipStartBeat() { return trackClip.get('clipStartBeatWithTransition'); },
      clipEndBeat() { return trackClip.get('clipEndBeatWithTransition'); },
    });
  });
});
