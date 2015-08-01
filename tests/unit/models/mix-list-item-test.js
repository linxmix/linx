import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { describeModel } from 'ember-mocha';
import { expect } from 'chai';
import sinon from 'sinon';

describeModel('mix-list-item', 'MixListItem',
  {
    needs: [
      'model:mix',
      'model:track',
      'model:echonest-track',
      'model:audio-meta',
      'model:transition',
      'model:transition-template'
    ]
  },
  function() {
  beforeEach(function() {
    var store = this.store();
    this.mixItem = this.subject();

    this.track = store.createRecord('track', {
      title: 'track'
    });

    this.transition = store.createRecord('transition', {
      title: 'transition'
    });
  });

  it('can add track', function() {
    expect(this.mixItem.get('track')).not.to.be.ok;
    this.mixItem.insertTrack(this.track);
    expect(this.mixItem.get('track')).to.be.ok;
  });

  it('can add transition', function() {
    expect(this.mixItem.get('transition')).not.to.be.ok;
    this.mixItem.insertTrack(this.transition);
    expect(this.mixItem.get('transition')).to.be.ok;
  });

  describe('with track', function() {
    beforeEach(function() {
      this.mixItem.insertTrack(this.track);
    });

    it.skip('has correct trackStartBeat and trackEndBeat', function() {
    });

    it('has invalid transition', function() {
      expect(this.mixItem.get('isValidTransition')).to.be.false;
    });
  });

  describe.skip('with track and valid transition', function() {
    beforeEach(function() {
      this.mixItem.insertTrack(this.track);
      this.mixItem.insertTransition(this.track);
    });

    it('has valid transition', function() {
      expect(this.mixItem.get('isValidTransition')).to.be.true;
    });

    it.skip('has correct trackStartBeat and trackEndBeat', function() {
      // expect(this.mix.get('length')).to.equal(2);
    });
  });

  describe.skip('with track and invalid transition', function() {
    beforeEach(function() {
      this.mixItem.insertTrack(this.track);
      this.mixItem.insertTransition(this.track);
    });

    it('has invalid transition', function() {
      expect(this.mixItem.get('isValidTransition')).to.be.false;
    });

    it.skip('has correct trackStartBeat and trackEndBeat', function() {
      // expect(this.mix.get('length')).to.equal(2);
    });
  });
});
