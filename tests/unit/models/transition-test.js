import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

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
  });

  it('generates toTrackMarker for toTrack', function() {
    expect(transition.get('toTrackMarker.content')).to.be.ok;
    expect(transition.get('toTrackMarker.audioMeta.content')).to.equal(transition.get('toTrack.audioMeta.content'));
  });

  describe.skip('#generateMix', function() {

  });
});
