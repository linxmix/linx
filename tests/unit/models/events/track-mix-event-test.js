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
    describeAttrs('trackMixEvent', {
      subject() { return this.factory.make('track-mix-event'); },
      isValid: false,
      startBeat: 0
    });
  });

  describe('with track and clip', function() {
    let track, trackMixClip, trackMixEvent;

    beforeEach(function() {
      let { track, trackMixClip, trackMixEvent } = makeTrackMixEvent.call(this);
    });

    describeAttrs('trackMixEvent', {
      subject() { return trackMixEvent; },
      track: track,
      isValid: true,
    });
  });
});
