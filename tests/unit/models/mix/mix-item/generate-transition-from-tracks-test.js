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
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('MixItemModel#generateTransitionFromTracks', function() {
  setupTestEnvironment();

  let mixItem;
  let fromTrack, toTrack, transition;

  beforeEach(function() {
    mixItem = this.factory.make('mix-item');

    fromTrack = makeTrack.call(this);
    toTrack = makeTrack.call(this);

    Ember.run(() => {
      mixItem.set('isReady', true);
    });
  });

  describe('without options', function() {
    beforeEach(function() {
      Ember.run(() => {
        wait(mixItem.generateTransitionFromTracks(fromTrack, toTrack).then((_transition) => {
          transition = _transition;
        }));
      });
    });

    describeAttrs('transition', {
      subject() { return transition; },
      'fromTrack.content': () => fromTrack,
      'toTrack.content': () => toTrack,
      fromTrackEndBeat() { return fromTrack.get('audioMeta.endBeat'); },
      toTrackStartBeat() { return toTrack.get('audioMeta.startBeat'); },
    });
  });
});
