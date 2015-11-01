import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import makeTrackClip from 'linx/tests/helpers/make-track-clip';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

import TrackClipComponent from 'linx/components/track-clip';

describe('TrackClipComponent', function() {
  setupTestEnvironment();

  let track, trackClip, pxPerBeat, syncBpm, clipSeekBeat, component;

  beforeEach(function() {
    let results = makeTrackClip.call(this);
    track = results.track;
    trackClip = results.trackClip;

    pxPerBeat = 15; syncBpm = 100; clipSeekBeat = 10;

    // setup component
    component = TrackClipComponent.create({
      clip: trackClip,
      pxPerBeat,
      syncBpm,
      clipSeekBeat,
    });
  });

  describeAttrs('track-clip component', {
    subject() { return component; },
    audioOffset: -4.487625521944136,
    audioSeekTime: 4.829209697390428,
    tempo: 0.7814881096584115,
  });

  describe('when clipSeekBeat changes', function() {
    let newSeekBeat;

    beforeEach(function() {
      newSeekBeat = clipSeekBeat * 2;
      component.set('clipSeekBeat', newSeekBeat);
    });

    describeAttrs('track-clip component', {
      subject() { return component; },
      audioSeekTime: 9.518138355340895,
    });
  });

  describe('when syncBpm changes', function() {
    let newSyncBpm;

    beforeEach(function() {
      newSyncBpm = syncBpm * 1.5;
      component.set('syncBpm', newSyncBpm);
    });

    describeAttrs('track-clip component', {
      subject() { return component; },
      audioSeekTime: 4.829209697390428,
      tempo: 1.1722321644876172,
    });
  });

  describe('when pxPerBeat changes', function() {
    let newPxPerBeat;

    beforeEach(function() {
      newPxPerBeat = pxPerBeat * 1.5;
      component.set('pxPerBeat', newPxPerBeat);
    });

    describeAttrs('track-clip component', {
      subject() { return component; },
      audioOffset: -6.731438282916205,
    });
  });
});
