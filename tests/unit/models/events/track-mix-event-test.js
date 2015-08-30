import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';
import makeTrackMixEvent from 'linx/tests/helpers/make-track-mix-event';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('TrackMixEvent', function() {
  setupUnitTest();

  describe('when empty', function() {
    let trackMixEvent;

    beforeEach(function() {
      trackMixEvent = this.factory.make('track-mix-event');
      trackMixEvent.set('clip', null);
    });

    describeAttrs('trackMixEvent', {
      subject() { return trackMixEvent; },
      isValid: false,
      startBeat: 0
    });
  });

  describe('with track and clip', function() {
    let track, trackMixClip, trackMixEvent;

    beforeEach(function() {
      let results = makeTrackMixEvent.call(this);
      track = results.track;
      trackMixClip = results.trackMixClip;
      trackMixEvent = results.trackMixEvent;
    });

    describeAttrs('trackMixEvent', {
      subject() { return trackMixEvent; },
      'track.content': () => track,
      isValid: true,
    });
  });
});
