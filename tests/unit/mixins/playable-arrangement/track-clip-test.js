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

  let arrangement, metronome, clip, track, startBeat, audioStartBeat, audioEndBeat;

  beforeEach(function() {
    track = this.factory.make('track');
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
    metronome = arrangement.get('metronome');
    let trackStartBeat = track.get('audioMeta.startBeat');
    let trackCenterBeat = track.get('audioMeta.centerBeat');
    let trackEndBeat = track.get('audioMeta.endBeat');
    audioStartBeat = Faker.random.number({ min: trackStartBeat, max: trackCenterBeat });
    audioEndBeat = Faker.random.number({ min: trackCenterBeat, max: trackEndBeat });
    startBeat = Faker.random.number({ min: 0, max: 10 });

    clip = DummyClip.create({
      startBeat,
      arrangement,
      track,
      audioStartBeat,
      audioEndBeat
    });
  });

  it('exists', function() {
    expect(clip).to.be.ok;
  });

  it('has sourceNode', function() {
    expect(clip.get('trackSourceNode')).to.be.ok;
  });

  describeAttrs('clip', {
    subject() { return clip; },
    startBeat() { return startBeat; },
    beatCount() { return clip.get('audioBeatCount'); },
    audioBeatCount() { return audioEndBeat - audioStartBeat; },
    audioStartTime() { return clip.get('audioBeatGrid').beatToTime(audioStartBeat); },
    audioEndTime() { return clip.get('audioBeatGrid').beatToTime(audioEndBeat); },
    audioDuration() { return clip.get('audioEndTime') - clip.get('audioStartTime'); },
    audioOffset() { return clip.get('audioBeatGrid.firstBarOffset') - clip.get('audioStartTime'); },
    tempo() { return metronome.get('bpm') / clip.get('audioMeta.bpm'); },
    outputNode() { return arrangement.get('inputNode'); },
    audioContext() { return arrangement.get('audioContext'); },
    metronome() { return arrangement.get('metronome'); },
    isValid: true,
    isValidStartBeat: true,
    isValidEndBeat: true,
    isValidBeatCount: true,
  });

  it('#getCurrentAudioBeat', function() {
    expect(clip.getCurrentAudioBeat()).to.equal(clip.getCurrentBeat() + audioStartBeat);
  });

  it('#getCurrentAudioTime', function() {
    expect(clip.getCurrentAudioTime()).to.equal(clip.get('audioBeatGrid').beatToTime(clip.getCurrentAudioBeat()));
  });

  describe('#audioScheduleDidChange', function() {
    let startSourceStub;

    beforeEach(function() {
      startSourceStub = this.sinon.stub(clip, 'startSource');
    });

    it('is called when schedule is triggered', function() {
      Ember.run(clip, 'trigger', 'schedule');
      expect(startSourceStub.calledOnce).to.be.true;
    });

    it('is called when audioStartBeat changes', function() {
      Ember.run(clip, 'set', 'audioStartBeat', audioStartBeat / 2.0);
      expect(startSourceStub.calledOnce).to.be.true;
    });

    it('is called when audioEndBeat changes', function() {
      Ember.run(clip, 'set', 'audioEndBeat', clip.get('halfBeatCount'));
      expect(startSourceStub.calledOnce).to.be.true;
    });
  });

  describe('#stopSource', function() {
    let stopSourceStub;

    beforeEach(function() {
      stopSourceStub = this.sinon.stub(clip, 'stopSource');
    });

    it('is called when unschedule is triggered', function() {
      Ember.run(clip, 'trigger', 'unschedule');
      expect(stopSourceStub.calledOnce).to.be.true;
    });
  });

  describe('#startSource', function() {
    let trackSourceNode, startStub;

    beforeEach(function() {
      let trackSourceNode = clip.get('trackSourceNode');
      startStub = this.sinon.stub(trackSourceNode, 'start');

    });

    describe('when not scheduled', function() {
      it('does not call trackSourceNode.start', function() {
        Ember.run(clip, 'startSource');
        expect(startStub.called).to.be.false;
      });
    });

    describe('when scheduled', function() {
      beforeEach(function() {
        Ember.run(clip, 'set', 'isScheduled', true);
        Ember.run(clip, 'startSource');
      });

      it('calls trackSourceNode.start with correct arguments', function() {
        expect(startStub.calledOnce).to.be.true;
        let when = metronome.beatToTime(clip.get('startBeat'));
        let offset = clip.getCurrentAudioTime();
        let duration = clip.get('audioDuration') - offset;
        expect(startStub.calledWithExactly(when, offset, duration)).to.be.true;
      });
    });
  });
});
