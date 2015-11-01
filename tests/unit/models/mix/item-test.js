import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import makeTransition from 'linx/tests/helpers/make-transition';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

import { asResolvedPromise } from 'linx/lib/utils';

describe('MixItemModel', function() {
  setupTestEnvironment();

  let mixItem;
  let fromTrack, toTrack, transition;

  beforeEach(function() {
    mixItem = this.factory.make('mix/item');

    let results = makeTransition.call(this);
    transition = results.transition;
    fromTrack = results.fromTrack;
    toTrack = results.toTrack;

    Ember.run(() => {
      mixItem.setProperties({
        transition,
        isReady: true,
        listReadyPromise: asResolvedPromise(),
      });
    });
  });

  describeAttrs('mixItem', {
    subject() { return mixItem; },
    'transitionClip.transition.content': () => transition,
    'fromTrackClip.model.content': () => fromTrack,
    'toTrackClip.model.content': () => toTrack,
  });

  describe('#generateTransitionFromTracks', function() {
    let generatedTransition;

    describe('without constraints', function() {
      beforeEach(function() {
        Ember.run(() => {
          wait(mixItem.generateTransition({ fromTrack, toTrack }).then((_transition) => {
            generatedTransition = _transition;
          }));
        });
      });

      describeAttrs('generatedTransition', {
        subject() { return generatedTransition; },
        'fromTrack.content': () => fromTrack,
        'toTrack.content': () => toTrack,
        fromTrackEndBeat() { return fromTrack.get('audioMeta.endBeat'); },
        toTrackStartBeat() { return toTrack.get('audioMeta.startBeat'); },
        numBeats: 16,
      });

      it('set transition on item model', function() {
        expect(mixItem.get('transition.content')).to.equal(generatedTransition);
      });

      it('returns a transition', function() {
        expect(transition.get('constructor.modelName')).to.equal('transition');
      });
    });
  });
});
