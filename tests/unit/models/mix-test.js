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

describe('MixModel', function() {
  setupTestEnvironment();

  let mix;

  beforeEach(function() {
    mix = this.factory.make('mix');
  });

  it('exists', function() {
    expect(mix).to.be.ok;
  });

  describe('without matching transitions', function() {
    let transitions, tracks, numTransitions = 10;

    beforeEach(function() {
      transitions = this.factory.makeList('transition', numTransitions);
      tracks = transitions.reduce((tracks, transition) => {
        tracks.push(transition.get('fromTrack.content'));
        tracks.push(transition.get('toTrack.content'));
        return tracks;
      }, []);

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

    describeAttrs('item', {
      subject() { return mix.objectAt(1); },
      prevTransitionIsMatch: false,
      nextTransitionIsMatch: false,
    });
  });

  describe('with matching transitions', function() {
    let prevTransition, transition, nextTransition;
    let prevItem, item, nextItem;

    beforeEach(function() {
      prevTransition = this.factory.make('transition');
      nextTransition = this.factory.make('transition');

      console.log("pre make transitoin", prevTransition.get('toTrack.content'), nextTransition.get('fromTrack.content'));
      transition = this.factory.make('transition', {
        fromTrack: prevTransition.get('toTrack.content'),
        toTrack: nextTransition.get('fromTrack.content'),
      });
      console.log("post make transitoin");

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

    describeAttrs('item', {
      subject() { return item; },
      prevTransitionIsMatch: true,
      nextTransitionIsMatch: true,
    });
  });
});
