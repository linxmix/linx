import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import Faker from 'npm:faker';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import PlayableTrackClipMixin from 'linx/mixins/playable-arrangement/track-clip';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import { DummyArrangement } from '../playable-arrangement-test';

export const DummyClip = Ember.Object.extend(PlayableTrackClipMixin);

describe('PlayableTrackClipMixin', function() {
  setupTestEnvironment();

  let arrangement, clip, track, audioStartBeat, audioEndBeat;

  beforeEach(function() {
    track = this.factory.make('track');
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
    let trackStartBeat = track.get('audioMeta.startBeat');
    let trackCenterBeat = track.get('audioMeta.centerBeat');
    let trackEndBeat = track.get('audioMeta.endBeat');
    audioStartBeat = Faker.random.number({ min: trackStartBeat, max: trackCenterBeat });
    audioEndBeat = Faker.random.number({ min: trackCenterBeat, max: trackEndBeat });

    clip = DummyClip.create({
      arrangement,
      track,
      audioStartBeat,
      audioEndBeat
    });
  });

  it('exists', function() {
    expect(clip).to.be.ok;
  });
});

//   // TODO: refactor into mixable clip behaviours
//   describe('without other clips', function() {
//     beforeEach(function() {
//       Ember.run(() => {
//         trackClip.setProperties({
//           isFirstClip: true,
//         });
//       });
//     });

//     describeAttrs('trackClip', {
//       subject() { return trackClip; },
//       startBeat: 0,
//       numBeats() { return track.get('audioMeta.numBeats'); },
//       audioStartBeatWithoutTransition() { return track.get('audioMeta.startBeat'); },
//       audioEndBeatWithoutTransition() { return track.get('audioMeta.endBeat'); },
//       audioStartBeat() { return trackClip.get('audioStartBeatWithoutTransition'); },
//       audioEndBeat() { return trackClip.get('audioEndBeatWithoutTransition'); },
//     });
//   });
