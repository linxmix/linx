import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';
import makeTrack from 'linx/tests/helpers/make-track';
import makeTransition from 'linx/tests/helpers/make-transition';

describe('MixListItem', function() {
  setupUnitTest();

  let mixItem;

  beforeEach(function() {
    mixItem = this.factory.make('mix-list-item');

    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('mix-list-item');
  });

  describe('when empty', function() {
    it('has invalid transition', function() {
      expect(mixItem.get('hasValidTransition')).to.be.false;
    });

    it('has no transition', function() {
      expect(mixItem.get('hasTransition')).to.be.false;
    });

    it('times are not valid', function() {
      expect(mixItem.get('timesAreValid')).to.be.false;
    });
  });

  describe('with track', function() {
    let track, firstBeatStart, lastBeatStart;

    beforeEach(function() {
      track = makeTrack.call(this);

      Ember.run(function() {
        wait(mixItem.insertTrack(track));
      });
    });

    it('can add track', function() {
      expect(mixItem.get('track.content')).to.equal(track);
    });

    it('is deleted when track is removed', function() {
      wait(mixItem.removeTrack());

      andThen(function() {
        expect(mixItem.get('isDeleted')).to.be.true;
      });
    });

    it('has invalid transition', function() {
      expect(mixItem.get('hasValidTransition')).to.be.false;
    });

    it('times are valid', function() {
      expect(mixItem.get('timesAreValid')).to.be.true;
    });

    it('has correct trackStartBeat', function() {
      expect(mixItem.get('trackStartBeat')).to.be.closeTo(track.get('audioMeta.firstBeat'), 0.005);
    });

    it('has correct trackEndBeat', function() {
      expect(mixItem.get('trackEndBeat')).to.be.closeTo(track.get('audioMeta.lastBeat'), 0.005);
    });

    it('has correct trackLengthBeats', function() {
      expect(mixItem.get('trackLengthBeats')).to.be.closeTo(track.get('audioMeta.numBeats'), 0.005);
    });
  });

  describe('with track and transition', function() {
    let track, transition;

    beforeEach(function() {
      track = makeTrack.call(this);
      transition = makeTransition.call(this, {
        fromTrack: track
      });

      Ember.run(function() {
        wait(mixItem.insertTrack(track));
        wait(mixItem.insertTransition(transition));
      });
    });

    it('can add transition', function() {
      expect(mixItem.get('transition.content')).to.equal(transition);
    });

    it('has transition', function() {
      expect(mixItem.get('hasTransition')).to.be.true;
    });

    it('times are valid', function() {
      expect(mixItem.get('timesAreValid')).to.be.true;
    });

    // expect invalid transition because there is no toTrack
    it('has invalid transition', function() {
      expect(mixItem.get('hasValidTransition')).to.be.false;
    });

    it('has correct trackStartBeat', function() {
      expect(mixItem.get('trackStartBeat')).to.be.closeTo(track.get('audioMeta.firstBeat'), 0.005);
    });

    it('has correct trackEndBeat', function() {
      expect(mixItem.get('trackEndBeat')).to.be.closeTo(track.get('audioMeta.lastBeat'), 0.005);
    });

    it('has correct trackLengthBeats', function() {
      expect(mixItem.get('trackLengthBeats')).to.be.closeTo(track.get('audioMeta.numBeats'), 0.005);
    });
  });

  // describe.skip('with track and invalid transition', function() {
  //   beforeEach(function() {
  //     this.mixItem.insertTrack(this.track);
  //     this.mixItem.insertTransition(this.track);
  //   });

  //   it('has invalid transition', function() {
  //     expect(this.mixItem.get('isValidTransition')).to.be.false;
  //   });

  //   it.skip('has correct trackStartBeat and trackEndBeat', function() {
  //     // expect(this.mix.get('length')).to.equal(2);
  //   });
  // });
});
