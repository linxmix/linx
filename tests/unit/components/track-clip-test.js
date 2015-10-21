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

  let track, trackClip, pxPerBeat, syncBpm, seekBeat, component;

  beforeEach(function() {
    let results = makeTrackClip.call(this);
    track = results.track;
    trackClip = results.trackClip;

    pxPerBeat = 15; syncBpm = 100; seekBeat = 10;

    // setup component
    component = TrackClipComponent.create({
      clip: trackClip,
      pxPerBeat,
      syncBpm,
      seekBeat,
    });
  });

  describeAttrs('track-clip component', {
    subject() { return component; },
    beatgridOffset: -5.102809647500005,
    seekTime: 4.688928657950469,
    audioSeekTime: 4.848440060565328,
    tempo: 0.7814881096584115,
  });

  describe('when seekBeat changes', function() {
    let newSeekBeat;

    beforeEach(function() {
      newSeekBeat = seekBeat * 2;
      component.set('seekBeat', newSeekBeat);
    });

    describeAttrs('track-clip component', {
      subject() { return component; },
      seekTime: 9.377857315900938,
      audioSeekTime: 9.537368718515797,
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
      seekTime: 4.688928657950469,
      audioSeekTime: 4.848440060565328,
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
      beatgridOffset: -7.6542144712500075,
    });
  });
});
