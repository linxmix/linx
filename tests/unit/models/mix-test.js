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

describe('MixModel', function() {
  setupTestEnvironment();

  let mix;

  beforeEach(function() {
    mix = this.factory.make('mix');
  });

  describe('without matching transitions', function() {
    let transitions, tracks, numTransitions = 10;

    beforeEach(function() {
      transitions = [];
      tracks = [];
      for (let i = 0; i < numTransitions; i++) {
        let { transition, fromTrack, toTrack } = makeTransition.call(this);

        transitions.push(transition);
        tracks.addObjects([fromTrack, toTrack]);
      }

      mix.appendTransitions(transitions);

      // TODO(DBSTUB)
      // this.factoryHelper.handleCreate('mix');
    });

    describeAttrs('mix', {
      subject() { return mix; },
      'items.length': () => transitions.length,

      'fromTracks.length': () => transitions.length,
      'toTracks.length': () => transitions.length,
      'tracks.length': () => tracks.length,

      'fromTrackClips.length': () => transitions.length,
      'toTrackClips.length': () => transitions.length,
      'trackClips.length': () => tracks.length,

      'transitionClips.length': () => transitions.length,
      'clips.length': () => tracks.length + transitions.length,
    });

    it('inserts transitions in correct places', function() {
      transitions.forEach((transition, i) => {
        expect(mix.transitionAt(i)).to.equal(transition);
      });
    });

    it('adjacent items do not share track clips', function() {
      let prevItem = mix.objectAt(0);
      let item = mix.objectAt(1);
      let nextItem = mix.objectAt(2);

      expect(prevItem.get('toTrackClip')).not.to.equal(item.get('fromTrackClip'));
      expect(item.get('toTrackClip')).not.to.equal(nextItem.get('fromTrackClip'));
    });
  });

  describe('with matching transitions', function() {
    let prevTransition, transition, nextTransition;
    let prevItem, item, nextItem;

    beforeEach(function() {
      let prevResults = makeTransition.call(this);
      prevTransition = prevResults.transition;

      let nextResults = makeTransition.call(this);
      nextTransition = nextResults.transition;

      let results = makeTransition.call(this, {
        fromTrack: prevResults.toTrack,
        toTrack: nextResults.fromTrack
      });
      transition = results.transition;

      prevItem = mix.appendTransition(prevTransition);
      item = mix.appendTransition(transition);
      nextItem = mix.appendTransition(nextTransition);
    });

    describeAttrs('mix', {
      subject() { return mix; },
      'items.length': () => 3,

      'fromTracks.length': () => 3,
      'toTracks.length': () => 3,
      'tracks.length': () => 4,

      'fromTrackClips.length': () => 3,
      'toTrackClips.length': () => 3,
      'trackClips.length': () => 4,

      'transitionClips.length': 3,
      'clips.length': () => 7,
    });

    it('adjacent items do share track clips', function() {
      expect(prevItem.get('toTrackClip')).to.equal(item.get('fromTrackClip'));
      expect(item.get('toTrackClip')).to.equal(nextItem.get('fromTrackClip'));
    });
  });
});
