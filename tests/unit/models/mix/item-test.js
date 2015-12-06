import Ember from 'ember';
import DS from 'ember-data';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import _ from 'npm:underscore';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import { asResolvedPromise } from 'linx/lib/utils';

describe('MixItemModel', function() {
  setupTestEnvironment();

  let mixItem;

  describe('in isolation', function() {
    beforeEach(function() {
      mixItem = this.mixItem = this.factory.make('mix/item');
    });

    it('exists', function() {
      expect(mixItem).to.be.ok;
    });

    it('generates transition', function() {
      expect(mixItem.get('transition.content')).to.be.ok;
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

    describeOptimizeTransition();
  });

  describe('with adjacent items', function() {
    let mix, prevItem, nextItem;

    beforeEach(function() {
      mix = this.factory.make('mix', {
        _mixItems: this.factory.makeList('mix/item', 3),
      });

      prevItem = mix.objectAt(0);
      mixItem = this.mixItem = mix.objectAt(1);
      nextItem = mix.objectAt(2);
    });

    describe('without matching transitions', function() {
      it('adjacent items do not share track clips', function() {
        expect(prevItem.get('toTrackClip')).not.to.equal(mixItem.get('fromTrackClip'));
        expect(mixItem.get('toTrackClip')).not.to.equal(nextItem.get('fromTrackClip'));
      });

      describeAttrs('prevItem', {
        subject() { return prevItem; },
        nextTransitionIsMatch: false,
      });

      describeAttrs('mixItem', {
        subject() { return mixItem; },
        prevTransitionIsMatch: false,
        nextTransitionIsMatch: false,
      });

      describeAttrs('nextItem', {
        subject() { return nextItem; },
        prevTransitionIsMatch: false,
      });

      describeOptimizeTransition();
    });

    describe('with matching transitions', function() {
      beforeEach(function() {
        Ember.run(() => {
          mixItem.get('transition.content').setProperties({
            fromTrack: prevItem.get('transition.toTrack.content'),
            toTrack: nextItem.get('transition.fromTrack.content'),
          });
        });
      });

      it('adjacent items do share track clips', function() {
        expect(prevItem.get('toTrackClip')).to.equal(mixItem.get('fromTrackClip'));
        expect(mixItem.get('toTrackClip')).to.equal(nextItem.get('fromTrackClip'));
      });

      describeAttrs('prevItem', {
        subject() { return prevItem; },
        nextTransitionIsMatch: true,
      });

      describeAttrs('mixItem', {
        subject() { return mixItem; },
        prevTransitionIsMatch: true,
        nextTransitionIsMatch: true,
      });

      describeAttrs('nextItem', {
        subject() { return nextItem; },
        prevTransitionIsMatch: true,
      });

      describeOptimizeTransition();
    });
  });
});

// describes this.mixItem#optimizeTransition with this.options
function describeOptimizeTransition() {
  describe('#optimizeTransition', function() {
    let mixItem;
    let transition, optimizeStub, fromTrack, toTrack;
    let options, expectedOptions;

    beforeEach(function() {
      mixItem = this.mixItem;
      options = this.options || {
        optionOne: 'a',
        optionTwo: 'b',
      };

      fromTrack = mixItem.get('fromTrack.content');
      toTrack = mixItem.get('toTrack.content');
      transition = mixItem.get('transition.content');

      // add default expectations to given options
      expectedOptions = _.extend({
        fromTrack: mixItem.get('prevTransition.toTrack'),
        toTrack: mixItem.get('nextTransition.fromTrack'),
        minFromTrackEndBeat: mixItem.get('prevTransition.toTrackStartBeat'),
        maxToTrackStartBeat: mixItem.get('nextTransition.fromTrackEndBeat'),
      }, options);

      optimizeStub = this.sinon.stub(transition, 'optimize').returns(asResolvedPromise(transition));

      Ember.run(() => {
        wait(mixItem.optimizeTransition(options));
      });
    });

    it('calls transition.optimize with correct args', function() {
      expect(optimizeStub.calledOnce).to.be.true;
      let actualOptions = optimizeStub.getCall(0).args[0];
      expect(actualOptions).to.deep.equal(expectedOptions);
    });
  });
}
