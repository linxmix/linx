import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import makeTrackClip from 'linx/tests/helpers/make-track-clip';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('TrackClipComponent', function() {
  setupTestEnvironment();

  let track, trackClip, pxPerBeat, syncBpm, seekBeat, component;

  beforeEach(function() {
    let results = makeTrackClip.call(this);
    track = results.track;
    trackClip = results.trackClip;

    pxPerBeat = 15; syncBpm = 100; seekBeat = 10;

    // setup component
    component = this.container.lookup('component:track-clip');
    component.setProperties({
      clip: trackClip,
      pxPerBeat,
      syncBpm,
      seekBeat,
    });
  });

  describeAttrs('track-clip component', {
    subject() { return component; },
    startPx: '5.102809647500005px',
    seekTime: 4.688928657950469,
    audioSeekTime: 5.007951463180188,
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
      audioSeekTime: 9.696880121130656,
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
      audioSeekTime: 5.007951463180188,
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
      startPx: '7.6542144712500075px',
    });
  });
});
