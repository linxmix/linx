import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';

export const DummyArrangement = Ember.Object.extend(PlayableArrangementMixin, {
  clips: Ember.computed(() => []),
});

describe('PlayableArrangementMixin', function() {
  setupTestEnvironment();

  let arrangement;

  describe('without clips', function() {
    beforeEach(function() {
      arrangement = DummyArrangement.create({
        audioContext: this.audioContext,
      });
    });

    it('exists', function() {
      expect(arrangement).to.be.ok;
    });

    it('has inputNode', function() {
      expect(arrangement.get('inputNode')).to.be.ok;
    });

    it('has correct outputNode', function() {
      expect(arrangement.get('outputNode')).to.equal(this.audioContext.destination);
    });

    it('has correct audioGraph', function() {
      Ember.run(() => {
        // trigger input node
        arrangement.get('inputNode');
      });

      expect(this.audioContext.toJSON()).to.deep.equal({
        "name": "AudioDestinationNode",
        "inputs": [
          {
            "name": "ChannelMergerNode",
            "inputs": [[], [], [], [], [], [], [], [], [], []],
          }
        ]
      });
    });
  });

  describe('with track clips', function() {
    let trackClips, trackClipsLength = 5;

    // TODO: requireAttributes is asking for audioContext before we're ready
    beforeEach(function() {
      trackClips = this.factory.makeList('arrangement/track-clip', trackClipsLength);
      arrangement = this.factory.make('arrangement', {
        trackClips,
      });
    });

    it('has correct audioGraph', function() {
      Ember.run(() => {
        // trigger input node
        arrangement.get('inputNode');
      });

      expect(this.audioContext.toJSON()).to.deep.equal({
        "name": "AudioDestinationNode",
        "inputs": [
          {
            "name": "ChannelMergerNode",
            "inputs": [[], [], [], [], [], [], [], [], [], []],
          }
        ]
      });
    });
  });
});
