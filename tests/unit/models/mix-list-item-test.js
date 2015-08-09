import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

describe.only('MixListItem', function() {
  setupUnitTest();

  let mix, mixItem, track, transition;

  beforeEach(function() {
    // mix = this.factory.make('mix');
    mixItem = this.factory.make('mix-list-item');
    track = this.factory.make('giveitupforlove');
    transition = this.factory.make('transition');
  });

  it('has invalid transition when no transition', function() {
    expect(mixItem.get('hasValidTransition')).to.be.false;
  });

  describe('with track', function() {
    beforeEach(function() {
      Ember.run(function() {
        wait(mixItem.insertTrack(track));
      });
    });

    it('has invalid transition when no transition', function() {
      expect(mixItem.get('hasValidTransition')).to.be.false;
      debugger
    });

    it('has correct trackStartBeat', function() {
      expect(mixItem.get('trackStartBeat')).to.equal(0);
    });

    it('has correct trackEndBeat', function() {
      expect(mixItem.get('trackEndBeat')).to.equal(0);
    });

    // TODO: test adding and removing?
    // it('can add track', function() {
    //   expect(mixItem.get('track.content')).to.equal(track);
    // });

    // it('can remove track', function() {
    //   wait(mixItem.removeTrack());

    //   andThen(function() {
    //     expect(mixItem.get('track.content')).not.to.be.ok;
    //   });
    // });

  });

  // describe.skip('with track and valid transition', function() {
  //   beforeEach(function() {
  //     this.mixItem.insertTrack(this.track);
  //     this.mixItem.insertTransition(this.track);
  //   });

  //   it('has valid transition', function() {
  //     expect(this.mixItem.get('isValidTransition')).to.be.true;
  //   });

  //   it.skip('has correct trackStartBeat and trackEndBeat', function() {
  //     // expect(this.mix.get('length')).to.equal(2);
  //   });
  // });

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
