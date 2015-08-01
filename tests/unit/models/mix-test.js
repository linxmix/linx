import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { describeModel } from 'ember-mocha';
import { expect } from 'chai';
import sinon from 'sinon';

describeModel('mix', 'Mix',
  {
    needs: [
      'model:mix-list-item',
      'model:track',
      'model:echonest-track',
      'model:audio-meta',
      'model:transition',
      'model:transition-template'
    ]
  },
  function() {
  beforeEach(function() {
    console.log("HI");
    var store = this.store();
    this.mix = this.subject();

    this.track1 = store.createRecord('track', {
      title: 'track1'
    });
    this.track2 = store.createRecord('track', {
      title: 'track2'
    });
    this.track3 = store.createRecord('track', {
      title: 'track3'
    });

    this.transition1 = store.createRecord('transition', {
      title: 'transition1'
    });
    this.transition2 = store.createRecord('transition', {
      title: 'transition2'
    });
    console.log("FINISH SETUP");
  });

  describe('two tracks', function() {
    beforeEach(function() {
      this.mix.appendTrack(this.track1);
      this.mix.appendTrack(this.track2);
    });

    it('has correct length', function() {
      expect(this.mix.get('length')).to.equal(2);
    });

    it.skip('has correct mixItem times', function() {
    });
  });
});
