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

  let mix, transitions, tracks, numTransitions = 10;

  beforeEach(function() {
    mix = this.factory.make('mix');

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
});
