import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import { TransitionMarker } from 'linx/mixins/models/transition/track-properties';

describe('TransitionModel', function() {
  setupTestEnvironment();

  let transition;

  beforeEach(function() {
    transition = this.factory.make('transition');
  });

  it('exists', function() {
    expect(transition).to.be.ok;
  });

  it('generates arrangement', function() {
    expect(transition.get('arrangement.content')).to.be.ok;
  });

  it('generates fromTrackMarker correctly', function() {
    expect(transition.get('fromTrackMarker')).to.be.an.instanceof(TransitionMarker);
    expect(transition.get('fromTrackMarker.beatGrid')).to.equal(transition.get('fromTrack.audioMeta.beatGrid'));
  });

  it('generates toTrackMarker correctly', function() {
    expect(transition.get('toTrackMarker')).to.be.an.instanceof(TransitionMarker);
    expect(transition.get('toTrackMarker.beatGrid')).to.equal(transition.get('toTrack.audioMeta.beatGrid'));
  });

  describeAttrs('transition', {
    subject() { return transition; },
    fromTrackEndTime() { return transition.get('fromTrackMarker.time'); },
    fromTrackEndBeat() { return transition.get('fromTrackMarker.beat'); },
    toTrackStartBeat() { return transition.get('toTrackMarker.beat'); },
    toTrackStartTime() { return transition.get('toTrackMarker.time'); },
    beatCount() { return transition.get('arrangement.beatCount'); },
  });

  describe('setting fromTrackEndBeat', function() {
    let beat = 78.2093, time;

    beforeEach(function() {
      time = transition.get('fromTrack.audioMeta.beatGrid').beatToTime(beat);

      Ember.run(() => {
        transition.set('fromTrackEndBeat', beat);
      });
    });

     describeAttrs('transition', {
      subject: () => transition,
      fromTrackEndTime: () => time,
      fromTrackEndBeat: () => beat,
      hasDirtyAttributes: true,
    });
  });

  describe('setting toTrackStartBeat', function() {
    let beat = 78.2093, time;

    beforeEach(function() {
      time = transition.get('toTrack.audioMeta.beatGrid').beatToTime(beat);

      Ember.run(() => {
        transition.set('toTrackStartBeat', beat);
      });
    });

     describeAttrs('transition', {
      subject: () => transition,
      toTrackStartTime: () => time,
      toTrackStartBeat: () => beat,
      hasDirtyAttributes: true,
    });
  });

  describeSettingTrack('fromTrack');
  describeSettingTrack('toTrack');

  function describeSettingTrack(trackPath) {
    let markerPath = `${trackPath}Marker`;

    describe(`setting ${trackPath}`, function() {
      let track;

      beforeEach(function() {
        track = this.factory.make('track');

        Ember.run(() => {
          transition.set(trackPath, track);
        });
      });

      it('updates track relationship correctly', function() {
        expect(transition.get(`${trackPath}.id`)).to.equal(track.get('id'));
      });

      it('updates marker correctly', function() {
        expect(transition.get(`${markerPath}.beatGrid`)).to.equal(track.get('audioMeta.beatGrid'));
      });
    });
  }

  describe('#optimize', function() {
    let fromTrack, toTrack;

    beforeEach(function() {
      fromTrack = transition.get('fromTrack.content');
      toTrack = transition.get('toTrack.content');
    });

    describe('without constraints', function() {
      beforeEach(function() {
        Ember.run(() => {
          wait(transition.optimize());
        });
      });

      describeAttrs('optimized transition', {
        subject() { return transition; },
        'fromTrack.content': () => fromTrack,
        'toTrack.content': () => toTrack,
        fromTrackEndBeat() { return fromTrack.get('audioMeta.lastWholeBeat'); },
        toTrackStartBeat() { return toTrack.get('audioMeta.firstWholeBeat'); },
        beatCount: 16,
      });
    });

    describe('with tracks', function() {
      let newFromTrack, newToTrack;

      beforeEach(function() {
        newFromTrack = this.factory.make('track');
        newToTrack = this.factory.make('track');

        Ember.run(() => {
          wait(transition.optimize({
            fromTrack: newFromTrack,
            toTrack: newToTrack,
          }));
        });
      });

      describeAttrs('optimized transition', {
        subject: () => transition,
        'fromTrack.content': () => newFromTrack,
        'toTrack.content': () => newToTrack,
        'fromTrackMarker.beatGrid': () => newFromTrack.get('audioMeta.beatGrid'),
        'toTrackMarker.beatGrid': () => newToTrack.get('audioMeta.beatGrid'),
        fromTrackEndBeat: () => newFromTrack.get('audioMeta.lastWholeBeat'),
        toTrackStartBeat: () => newToTrack.get('audioMeta.firstWholeBeat'),
      });
    });

    // TODO(TRANSITION): write these tests when algorithm matters
    describe.skip('with other constraints', function() {});
  });
});
