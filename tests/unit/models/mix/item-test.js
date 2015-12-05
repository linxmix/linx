import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import { asResolvedPromise } from 'linx/lib/utils';

describe('MixItemModel', function() {
  setupTestEnvironment();

  let mix, mixItem;

  beforeEach(function() {
    mix = this.factory.make('mix', {
      _mixItems: this.factory.makeList('mix/item', 1),
    });
    mixItem = mix.objectAt(0);
  });

  describeAttrs('fromTrackClip', {
    subject() { return mixItem.get('fromTrackClip'); },
    track() { return mixItem.get('fromTrack.content'); },
    arrangement() { return mixItem.get('mix.content'); },
    toTransitionClip() { return mixItem.get('transitionClip'); },
  });

  describeAttrs('toTrackClip', {
    subject() { return mixItem.get('toTrackClip'); },
    track() { return mixItem.get('toTrack.content'); },
    arrangement() { return mixItem.get('mix.content'); },
    fromTransitionClip() { return mixItem.get('transitionClip'); },
  });

  describe('#generateTransition', function() {
    let generatedTransition, fromTrack, toTrack;

    // TODO(TRANSITION): make this work for passing in only one track?
    describe('without constraints', function() {
      beforeEach(function() {
        this.timeout(5000); // lots of saving going on in generateTransition

        fromTrack = this.factory.make('track');
        toTrack = this.factory.make('track');
        Ember.run(() => {
          wait(mixItem.generateTransition({ fromTrack, toTrack }).then((_transition) => {
            generatedTransition = _transition;
          }));
        });
      });

      it('set transition on item model', function() {
        expect(mixItem.get('transition.content')).to.equal(generatedTransition);
      });

      it('returns a transition', function() {
        expect(generatedTransition.get('constructor.modelName')).to.equal('transition');
      });

      describeAttrs('generatedTransition', {
        subject() { return generatedTransition; },
        'fromTrack.content': () => fromTrack,
        'toTrack.content': () => toTrack,
        fromTrackEndBeat() { return fromTrack.get('audioMeta.lastWholeBeat'); },
        toTrackStartBeat() { return toTrack.get('audioMeta.firstWholeBeat'); },
        beatCount: 16,
      });
    });

    // TODO(TRANSITION): write these tests with algorithm
    describe.skip('with constraints', function() {});
  });
});
