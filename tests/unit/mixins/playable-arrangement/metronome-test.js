import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import Metronome from 'linx/mixins/playable-arrangement/metronome';
import { beatToTime, timeToBeat } from 'linx/lib/utils'

const EPSILON = 0.0005;

describe('PlayableMetronome', function() {
  setupTestEnvironment();

  let metronome, bpm = 120.214;

  beforeEach(function() {
    metronome = Metronome.create({
      audioContext: this.audioContext,
      bpm,
    });
  });

  describeAttrs('basic metronome', {
    subject() { return metronome; },
    bpm() { return bpm },
    isPlaying: false,
    seekBeat: 0,
    absSeekTime: 0,
    lastPlayBeat: 0,
  });

  it('exists', function() {
    expect(metronome).to.be.ok;
  });

  describe('events', function() {
    let scheduleSpy, unscheduleSpy, playSpy, pauseSpy, seekSpy;

    beforeEach(function() {
      scheduleSpy = this.sinon.spy();
      unscheduleSpy = this.sinon.spy();
      playSpy = this.sinon.spy();
      pauseSpy = this.sinon.spy();
      seekSpy = this.sinon.spy();

      metronome.on('schedule', scheduleSpy);
      metronome.on('unschedule', unscheduleSpy);
      metronome.on('play', playSpy);
      metronome.on('seek', seekSpy);
      metronome.on('pause', pauseSpy);
    });

    describe('on play', function() {
      beforeEach(function() {
        Ember.run(metronome, 'play');
      });

      it('fires correct events', function() {
        expect(scheduleSpy.calledOnce).to.be.true;
        expect(unscheduleSpy.called).to.be.false;
        expect(playSpy.calledOnce).to.be.true;
        expect(pauseSpy.called).to.be.false;
        expect(seekSpy.called).to.be.false;
      });
    });

    describe('seek while paused', function() {
      beforeEach(function() {
        Ember.run(metronome, 'seekToBeat', 1);
      });

      it('fires correct events', function() {
        expect(scheduleSpy.called).to.be.false;
        expect(unscheduleSpy.called).to.be.false;
        expect(playSpy.called).to.be.false;
        expect(pauseSpy.called).to.be.false;
        expect(seekSpy.calledOnce).to.be.true;
      });
    });

    describe('seek while playing', function() {
      beforeEach(function() {
        Ember.run(() => {
          metronome.set('isPlaying', true);
          metronome.seekToBeat(1);
        });
      });

      it('fires correct events', function() {
        expect(scheduleSpy.calledOnce).to.be.true;
        expect(unscheduleSpy.called).to.be.false;
        expect(playSpy.called).to.be.false;
        expect(pauseSpy.called).to.be.false;
        expect(seekSpy.calledOnce).to.be.true;
      });
    });

    describe('on pause', function() {
      beforeEach(function() {
        Ember.run(() => {
          metronome.set('isPlaying', true);
          metronome.pause();
        });
      });

      it('fires correct events', function() {
        expect(scheduleSpy.called).to.be.false;
        expect(unscheduleSpy.calledOnce).to.be.true;
        expect(playSpy.called).to.be.false;
        expect(pauseSpy.calledOnce).to.be.true;
        expect(seekSpy.called).to.be.false;
      });
    });
  });

  describe('#getCurrentBeat', function() {
    let time = 60;

    it('is correct initially', function() {
      expect(metronome.getCurrentBeat()).to.be.closeTo(0, EPSILON);
    });

    it('is correct while playing and clock moves', function() {
      Ember.run(() => {
        metronome.play();
        this.audioContext.$processTo(time);
      });

      expect(metronome.getCurrentBeat()).to.be.closeTo(timeToBeat(time, bpm), EPSILON);
    });

    it('is correct while paused and clock moves', function() {
      Ember.run(() => {
        this.audioContext.$processTo(time);
      });

      expect(metronome.getCurrentBeat()).to.be.closeTo(0, EPSILON);
    });
  });

  describe('#beatToTime', function() {
    let beat = 10.5, time = 30;

    it('is correct initially', function() {
      expect(metronome.beatToTime(beat)).to.be.closeTo(beatToTime(beat, bpm), EPSILON);
    });

    it('is correct while playing and clock moves', function() {
      Ember.run(() => {
        metronome.play();
        this.audioContext.$processTo(time);
      });

      expect(metronome.beatToTime(beat)).to.be.closeTo(beatToTime(beat, bpm), EPSILON);
    });

    it('is correct while paused and clock moves', function() {
      Ember.run(() => {
        this.audioContext.$processTo(time);
      });

      expect(metronome.beatToTime(beat)).to.be.closeTo(this.getCurrentTime() + beatToTime(beat, bpm), EPSILON);
    });
  });
});
