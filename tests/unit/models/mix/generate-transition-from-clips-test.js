import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import makeTrack from 'linx/tests/helpers/make-track';
import makeTrackClip from 'linx/tests/helpers/make-track-clip';
import makeMix from 'linx/tests/helpers/make-mix';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('MixModel#generateTransitionFromClips', function() {
  setupTestEnvironment();

  let mix, arrangement;
  let fromTrackClip, toTrackClip;
  let generateTransitionFromTracksStub, options;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = this.mix = results.mix;
    arrangement = this.arrangement = results.arrangement;

    let fromResults = makeTrackClip.call(this);
    fromTrackClip = fromResults.trackClip;

    let toResults = makeTrackClip.call(this);
    toTrackClip = toResults.trackClip;

    generateTransitionFromTracksStub = this.sinon.stub(mix, 'generateTransitionFromTracks');

    options = {
      preset: 'preset',
    };

    Ember.run(() => {
      mix.generateTransitionFromClips(fromTrackClip, toTrackClip, options);
    });
  });

  it('calls generateTransitionFromTracks', function() {
    expect(generateTransitionFromTracksStub.calledOnce).to.be.true;
  });

  it('calls generateTransitionFromTracks with correct tracks', function() {
    expect(generateTransitionFromTracksStub.calledWith(fromTrackClip.get('model'), toTrackClip.get('model'))).to.be.true;
  });

  it('calls generateTransitionFromTracks with correct options', function() {
    let optionsArg = generateTransitionFromTracksStub.args[0][2];

    expect(optionsArg.preset).to.equal(options.preset);
    expect(optionsArg.minFromTrackEndBeat).to.equal(fromTrackClip.get('clipEndBeat'));
    expect(optionsArg.maxToTrackStartBeat).to.equal(toTrackClip.get('clipStartBeat'));
  });
});
