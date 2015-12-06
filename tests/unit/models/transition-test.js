import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from 'linx/models/track/audio-meta/marker';

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

  it('generates fromTrackMarker', function() {
    expect(transition.get('fromTrackMarker.content')).to.be.ok;
    expect(transition.get('fromTrackMarker.audioMeta.content')).to.equal(transition.get('fromTrack.audioMeta.content'));
    expect(transition.get('fromTrackMarker.type')).to.equal(TRANSITION_OUT_MARKER_TYPE);
  });

  it('generates toTrackMarker', function() {
    expect(transition.get('toTrackMarker.content')).to.be.ok;
    expect(transition.get('toTrackMarker.audioMeta.content')).to.equal(transition.get('toTrack.audioMeta.content'));
    expect(transition.get('toTrackMarker.type')).to.equal(TRANSITION_IN_MARKER_TYPE);
  });

  describeAttrs('transition', {
    subject() { return transition; },
    fromTrackEndBeat() { return transition.get('fromTrackMarker.startBeat'); },
    toTrackStartBeat() { return transition.get('toTrackMarker.startBeat'); },
    beatCount() { return transition.get('arrangement.beatCount'); },
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

      it('updates marker relationship correctly', function() {
        expect(transition.get(`${markerPath}.audioMeta.id`)).to.equal(track.get('audioMeta.id'));
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

    // TODO(TRANSITION): write these tests when algorithm matters
    describe.skip('with constraints', function() {});
  });
});
