import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
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

  it('generates fromTrackMarker for fromTrack', function() {
    expect(transition.get('fromTrackMarker.content')).to.be.ok;
    expect(transition.get('fromTrackMarker.audioMeta.content')).to.equal(transition.get('fromTrack.audioMeta.content'));
    expect(transition.get('fromTrackMarker.type')).to.equal(TRANSITION_OUT_MARKER_TYPE);
  });

  it('generates toTrackMarker for toTrack', function() {
    expect(transition.get('toTrackMarker.content')).to.be.ok;
    expect(transition.get('toTrackMarker.audioMeta.content')).to.equal(transition.get('toTrack.audioMeta.content'));
    expect(transition.get('toTrackMarker.type')).to.equal(TRANSITION_IN_MARKER_TYPE);
  });

  describe.skip('#generateMix', function() {

  });
});
