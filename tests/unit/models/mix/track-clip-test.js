import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import Faker from 'npm:faker';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import MixTrackClip from 'linx/models/mix/track-clip';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import { DummyArrangement } from '../playable-arrangement-test';

describe.skip('MixTrackClip', function() {
  setupTestEnvironment();

  let arrangement, clip, track, audioStartBeat, audioEndBeat;

  beforeEach(function() {
    track = this.factory.make('track');
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });

    clip = MixTrackClip.create({
      arrangement,
      track,
    });
  });

  it('exists', function() {
    expect(clip).to.be.ok;
  });
});

//   describe('with valid prevTransition', function() {
//     let prevClip, prevTransition;

//     beforeEach(function() {
//       let results = makeTransitionClip.call(this, { toTrackClip: trackClip });
//       prevClip = results.fromTrackClip;
//       prevTransition = results.transition;

//       Ember.run(() => {
//         trackClip.setProperties({
//           isFirstClip: false,
//         });

//         prevClip.setProperties({
//           isFirstClip: true,
//         });
//       });
//     });

//     describeAttrs('trackClip', {
//       subject() { return trackClip; },
//       startBeat() { return prevClip.get('endBeat') - prevTransition.get('numBeats'); },
//       numBeats() { return track.get('audioMeta.endBeat') - prevTransition.get('toTrackStartBeat'); },
//       audioStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
//       audioStartBeat() { return trackClip.get('audioStartBeatWithTransition'); },
//       audioEndBeat() { return trackClip.get('audioEndBeatWithoutTransition'); },
//     });
//   });

//   describe('with valid nextTransition', function() {
//     let nextClip, nextTransition;

//     beforeEach(function() {
//       let results = makeTransitionClip.call(this, { fromTrackClip: trackClip });
//       nextClip = results.transitionClip;
//       nextTransition = results.transition;

//       Ember.run(() => {
//         trackClip.setProperties({
//           isFirstClip: true,
//         });
//       });
//     });

//     describeAttrs('trackClip', {
//       subject() { return trackClip; },
//       startBeat: 0,
//       numBeats() { return nextTransition.get('fromTrackEndBeat') - track.get('audioMeta.startBeat'); },
//       audioEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
//       audioStartBeat() { return trackClip.get('audioStartBeatWithoutTransition'); },
//       audioEndBeat() { return trackClip.get('audioEndBeatWithTransition'); },
//     });
//   });

//   describe('with valid transitions', function() {
//     let prevClip, prevTransition, nextClip, nextTransition;

//     beforeEach(function() {

//       Ember.run(() => {
//         // setup prevClip
//         let prevResults = makeTransitionClip.call(this, { toTrackClip: trackClip });
//         prevClip = prevResults.fromTrackClip;
//         prevTransition = prevResults.transition;
//         prevClip.setProperties({
//           isFirstClip: true,
//         });

//         // setup nextClip
//         let nextResults = makeTransitionClip.call(this, { fromTrackClip: trackClip });
//         nextClip = nextResults.toTrackClip;
//         nextTransition = nextResults.transition;
//       });
//     });

//     describeAttrs('trackClip', {
//       subject() { return trackClip; },
//       startBeat() { return prevClip.get('endBeat') - prevTransition.get('numBeats'); },
//       numBeats() { return nextTransition.get('fromTrackEndBeat') - prevTransition.get('toTrackStartBeat'); },
//       audioStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
//       audioEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
//       audioStartBeat() { return trackClip.get('audioStartBeatWithTransition'); },
//       audioEndBeat() { return trackClip.get('audioEndBeatWithTransition'); },
//     });
//   });
// });
