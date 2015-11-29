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

  beforeEach(function() {
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
  });

  describe('without clips', function() {
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

  describe.skip('with clips', function() {
    it.skip('has correct beatCount');
  });
});
