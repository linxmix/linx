import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import PlayableClipMixin from 'linx/mixins/playable-arrangement/clip';
import { DummyArrangement } from '../playable-arrangement-test';

export const DummyClip = Ember.Object.extend(PlayableClipMixin);

describe('PlayableClipMixin', function() {
  setupTestEnvironment();

  let clip, metronome, arrangement, startBeat = 16.02, beatCount = 32.93;

  beforeEach(function() {
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
    metronome = arrangement.get('metronome');
    clip = DummyClip.create({
      arrangement,
      startBeat,
      beatCount,
    });
  });

  describeAttrs('clip', {
    subject() { return clip; },
    startBeat: startBeat,
    beatCount: beatCount,
    endBeat() { return startBeat + beatCount; },
    outputNode() { return arrangement.get('inputNode'); },
    audioContext() { return arrangement.get('audioContext'); },
    metronome() { return arrangement.get('metronome'); },
    isValid: true,
    isValidStartBeat: true,
    isValidEndBeat: true,
    isValidBeatCount: true,
  });

  describe('#clipScheduleDidChange', function() {
    let triggerScheduleEventsStub;

    beforeEach(function() {
      triggerScheduleEventsStub = this.sinon.stub(clip, 'triggerScheduleEvents');
    });

    it('is called when metronome.absSeekTime is changed', function() {
      Ember.run(metronome, 'incrementProperty', 'absSeekTime');
      expect(triggerScheduleEventsStub.calledOnce).to.be.true;
    });

    it('is called when metronome.isPlaying is changed', function() {
      Ember.run(metronome, 'toggleProperty', 'isPlaying');
      expect(triggerScheduleEventsStub.calledOnce).to.be.true;
    });

    it('is called when isValid is changed', function() {
      Ember.run(clip, 'toggleProperty', 'isValid');
      expect(triggerScheduleEventsStub.calledOnce).to.be.true;
    });

    it('is called when startBeat is changed', function() {
      Ember.run(clip, 'decrementProperty', 'startBeat');
      expect(triggerScheduleEventsStub.calledOnce).to.be.true;
    });

    it('is called when beatCount is changed', function() {
      Ember.run(clip, 'incrementProperty', 'beatCount');
      expect(triggerScheduleEventsStub.calledOnce).to.be.true;
    });
  });

  describe('#triggerScheduleEvents', function() {
    let scheduleSpy, unscheduleSpy;

    it('fires correct events when metronome is playing', function() {
      Ember.run(metronome, 'set', 'isPlaying', true);
      scheduleSpy = this.sinon.spy();
      unscheduleSpy = this.sinon.spy();
      clip.on('schedule', scheduleSpy);
      clip.on('unschedule', unscheduleSpy);
      Ember.run(clip, 'triggerScheduleEvents');

      expect(unscheduleSpy.calledOnce).to.be.true;
      expect(scheduleSpy.calledOnce).to.be.true;
    });

    it('fires correct events when metronome is paused', function() {
      scheduleSpy = this.sinon.spy();
      unscheduleSpy = this.sinon.spy();
      clip.on('schedule', scheduleSpy);
      clip.on('unschedule', unscheduleSpy);
      Ember.run(clip, 'triggerScheduleEvents');

      expect(unscheduleSpy.calledOnce).to.be.true;
      expect(scheduleSpy.calledOnce).to.be.false;
    });
  });

  describe('#getCurrentBeat', function() {
    let metronome;

    beforeEach(function() {
      metronome = arrangement.get('metronome');
    });

    it('lower bound is correct', function() {
      Ember.run(metronome, 'seekToBeat', -startBeat);
      expect(clip.getCurrentBeat()).to.equal(0);
    });

    it('upper bound is correct', function() {
      Ember.run(metronome, 'seekToBeat', beatCount * 2);
      expect(clip.getCurrentBeat()).to.equal(clip.get('beatCount'));
    });

    it('is correct between bounds', function() {
      Ember.run(metronome, 'seekToBeat', clip.get('centerBeat'));
      expect(clip.getCurrentBeat()).to.equal(clip.get('halfBeatCount'));
    });
  });
});
