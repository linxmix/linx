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
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('MixItem', function() {
  setupUnitTest();

  let mixItem;

  beforeEach(function() {
    mixItem = this.factory.make('mix-item');

    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('mix-item');
  });

  describe('when empty', function() {
    describeAttrs('mix-item', {
      subject() { return mixItem; },
      hasTransition: false,
      timesAreValid: false,
      fromTrackIsValid: false,
      toTrackIsValid: false,
      hasValidTransition: false,
    });
  });

  describe('with track', function() {
    let track;

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

    describeAttrs('mix-item', {
      subject() { return mixItem; },
      hasTransition: false,
      timesAreValid: false,
      fromTrackIsValid: false,
      toTrackIsValid: false,
      hasValidTransition: false,
      trackStartBeat() { return track.get('audioMeta.firstBeat'); },
      trackEndBeat() { return track.get('audioMeta.lastBeat'); },
      numTrackBeats() { return track.get('audioMeta.numBeats'); },
    });
  });

  describe('with track and transition', function() {
    let fromTrack, transition;

    beforeEach(function() {
      let results = makeTransition.call(this);
      fromTrack = results.fromTrack;
      transition = results.transition;

      Ember.run(function() {
        wait(mixItem.insertTrack(fromTrack));
        wait(mixItem.insertTransition(transition));
      });
    });

    it('can add transition', function() {
      expect(mixItem.get('transition.content')).to.equal(transition);
    });

    it('can remove transition', function() {
      Ember.run(function() {
        wait(mixItem.removeTransition());
      });

      andThen(function() {
        expect(mixItem.get('transition.content')).not.to.be.ok;
      });
    });

    describeAttrs('mix-item', {
      subject() { return mixItem; },
      hasTransition: true,
      timesAreValid: true,
      fromTrackIsValid: true,
      toTrackIsValid: false,
      hasValidTransition: false,
      trackStartBeat() { return fromTrack.get('audioMeta.firstBeat'); },
      trackEndBeat() { return fromTrack.get('audioMeta.lastBeat'); },
      numTrackBeats() { return fromTrack.get('audioMeta.numBeats'); },
    });
  });

  describe('with nextItem', function() {
    let nextItem;

    beforeEach(function() {
      nextItem = this.factory.make('mix-item');

      mixItem.set('nextItem', nextItem);
      nextItem.set('prevItem', mixItem);
    });

    it('nextItem is ok', function() {
      expect(mixItem.get('nextItem')).to.equal(nextItem);
    });

    it('prevItem is ok', function() {
      expect(mixItem).not.to.equal(nextItem);
      expect(nextItem.get('prevItem')).to.equal(mixItem);
    });

    describe('with fromTrack, transition, and toTrack', function() {
      let fromTrack, transition, toTrack;

      beforeEach(function() {
        let results = makeTransition.call(this);

        fromTrack = results.fromTrack;
        transition = results.transition;
        toTrack = results.toTrack;

        Ember.run(function() {
          wait(mixItem.insertTrack(fromTrack));
          wait(mixItem.insertTransition(transition));
          wait(nextItem.insertTrack(toTrack));
        });
      });

      describeAttrs('mix-item', {
        subject() { return mixItem; },
        hasTransition: true,
        timesAreValid: true,
        fromTrackIsValid: true,
        toTrackIsValid: true,
        hasValidTransition: true,
        trackStartBeat() { return fromTrack.get('audioMeta.firstBeat'); },
        trackEndBeat() { return transition.get('fromTrackEndBeat'); },
      });

      describeAttrs('next-item', {
        subject() { return nextItem; },
        hasTransition: false,
        trackStartBeat() { return transition.get('toTrackStartBeat'); },
        trackEndBeat() { return toTrack.get('audioMeta.lastBeat'); },
      });

      describe('when timing of transition is impossible', function() {
        beforeEach(function() {
          transition.setFromTrackEnd(-100);
        });

        describeAttrs('mix-item', {
          subject() { return mixItem; },
          hasTransition: true,
          timesAreValid: false,
          hasValidTransition: false,
          trackStartBeat() { return fromTrack.get('audioMeta.firstBeat'); },
          trackEndBeat() { return fromTrack.get('audioMeta.lastBeat'); },
        });

        describeAttrs('next-item', {
          subject() { return nextItem; },
          trackStartBeat() { return toTrack.get('audioMeta.firstBeat'); },
        });
      });
    });
  });

});
