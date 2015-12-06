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
import { DummyArrangement } from 'linx/tests/unit/mixins/playable-arrangement-test';

describe('MixTrackClip', function() {
  setupTestEnvironment();

  describe('without transitions', function() {
    let metronome, arrangement, clip, track;

    beforeEach(function() {
      track = this.factory.make('track');
      arrangement = DummyArrangement.create({
        audioContext: this.audioContext,
      });
      metronome = arrangement.get('metronome');
      clip = MixTrackClip.create({
        arrangement,
        track,
      });
    });

    it('exists', function() {
      expect(clip).to.be.ok;
    });

    describeAttrs('clip', {
      subject() { return clip; },
      fromTransitionClip: null,
      toTransitionClip: null,
      startBeat: 0,
      audioStartBeat() { return clip.get('audioStartBeatWithoutTransition'); },
      audioEndBeat() { return clip.get('audioEndBeatWithoutTransition'); },
      audioStartBeatWithoutTransition() { return clip.get('audioMeta.firstWholeBeat'); },
      audioEndBeatWithoutTransition() { return clip.get('audioMeta.lastWholeBeat'); },
    });
  });

  describe('with valid transitions', function() {
    let mix, item, nextItem, clip;

    beforeEach(function() {

      // setup transitions
      mix = this.factory.make('mix', {
        _mixItems: this.factory.makeList('mix/item', 2),
      });

      item = mix.objectAt(0);
      nextItem = mix.objectAt(1);

      item.get('transition.content').setProperties({
        toTrack: nextItem.get('transition.fromTrack.content'),
      });

      // we want the track clip between the transitions
      clip = item.get('toTrackClip');
    });

    describeAttrs('clip', {
      subject() { return clip; },
      fromTransitionClip() { return item.get('transitionClip'); },
      toTransitionClip() { return nextItem.get('transitionClip'); },
      startBeat() { return item.get('transitionClip.startBeat'); },
      audioStartBeat() { return clip.get('audioStartBeatWithTransition'); },
      audioEndBeat() { return clip.get('audioEndBeatWithTransition'); },
      audioStartBeatWithTransition() { return item.get('transition.toTrackStartBeat'); },
      audioEndBeatWithTransition() { return nextItem.get('transition.fromTrackEndBeat'); },
    });
  });

  describe.skip('with invalid transitions', function() {
    describeAttrs('clip', {
      subject() { return clip; },
      startBeat: 0,
      audioStartBeat() { return clip.get('audioStartBeatWithoutTransition'); },
      audioEndBeat() { return clip.get('audioEndBeatWithoutTransition'); },
    });
  });
});
