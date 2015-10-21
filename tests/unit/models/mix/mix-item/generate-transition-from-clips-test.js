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
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('MixItemModel#generateTransitionFromClips', function() {
  setupTestEnvironment();

  let mixItem;
  let fromTrackClip, toTrackClip;
  let generateTransitionFromTracksStub, options;

  beforeEach(function() {
    mixItem = this.factory.make('mix-item');

    let fromResults = makeTrackClip.call(this);
    fromTrackClip = fromResults.trackClip;

    let toResults = makeTrackClip.call(this);
    toTrackClip = toResults.trackClip;

    generateTransitionFromTracksStub = this.sinon.stub(mixItem, 'generateTransitionFromTracks');

    options = {
      preset: 'preset',
    };

    Ember.run(() => {
      mixItem.set('isReady', true);
      wait(mixItem.generateTransitionFromClips(fromTrackClip, toTrackClip, options));
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
