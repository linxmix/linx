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

    it('can persist endBeat', function() {
      Ember.run(function() {
        trackClip.set('endBeat', 3);
        wait(trackClip.save());
      });

      // TODO(DBSTUB): make this actually check payload
      andThen(function() {
        expect(trackClip.get('endBeat')).to.equal(3);
      });
    });
  });

  // TODO: refactor into mixable clip behaviours
  describe('without other clips', function() {
    beforeEach(function() {
      Ember.run(() => {
        trackClip.setProperties({
          isFirstClip: true,
        });
      });
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      startBeat: 0,
      numBeats() { return track.get('audioMeta.numBeats'); },
      audioStartBeatWithoutTransition() { return track.get('audioMeta.startBeat'); },
      audioEndBeatWithoutTransition() { return track.get('audioMeta.endBeat'); },
      audioStartBeat() { return trackClip.get('audioStartBeatWithoutTransition'); },
      audioEndBeat() { return trackClip.get('audioEndBeatWithoutTransition'); },
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
          isFirstClip: false,
        });

        prevClip.setProperties({
          isFirstClip: true,
        });
      });
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      startBeat() { return prevClip.get('endBeat') - prevTransition.get('numBeats'); },
      numBeats() { return track.get('audioMeta.endBeat') - prevTransition.get('toTrackStartBeat'); },
      audioStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      audioStartBeat() { return trackClip.get('audioStartBeatWithTransition'); },
      audioEndBeat() { return trackClip.get('audioEndBeatWithoutTransition'); },
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
          isFirstClip: true,
        });
      });
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      startBeat: 0,
      numBeats() { return nextTransition.get('fromTrackEndBeat') - track.get('audioMeta.startBeat'); },
      audioEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      audioStartBeat() { return trackClip.get('audioStartBeatWithoutTransition'); },
      audioEndBeat() { return trackClip.get('audioEndBeatWithTransition'); },
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
        prevClip.setProperties({
          isFirstClip: true,
        });

        // setup nextClip
        let nextResults = makeTransitionClip.call(this, { fromTrackClip: trackClip });
        nextClip = nextResults.toTrackClip;
        nextTransition = nextResults.transition;
      });
    });

    describeAttrs('trackClip', {
      subject() { return trackClip; },
      startBeat() { return prevClip.get('endBeat') - prevTransition.get('numBeats'); },
      numBeats() { return nextTransition.get('fromTrackEndBeat') - prevTransition.get('toTrackStartBeat'); },
      audioStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
      audioEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
      audioStartBeat() { return trackClip.get('audioStartBeatWithTransition'); },
      audioEndBeat() { return trackClip.get('audioEndBeatWithTransition'); },
    });
  });
});
