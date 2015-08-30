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
import makeTransitionMixEvent from 'linx/tests/helpers/make-transition-mix-event';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('TransitionMixEvent', function() {
  setupUnitTest();

  beforeEach(function() {
    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('transition-mix-event');
  });

  describe('when empty', function() {
    let transitionMixEvent;

    beforeEach(function() {
      transitionMixEvent = this.factory.make('transition-mix-event');
      transitionMixEvent.set('clip', null);
    });

    describeAttrs('transitionMixEvent', {
      subject() { return transitionMixEvent; },
      hasTransition: false,
      fromTrackIsValid: false,
      toTrackIsValid: false,
      timesAreValid: false,
      isValid: false,
      isValidTransition: false,
    });
  });

  describe('with valid fromTrackMixEvent and toTrackMixEvent', function() {
    let fromTrackMixEvent, transitionMixEvent, toTrackMixEvent;

    beforeEach(function() {
      let results = makeTransitionMixEvent.call(this);
      fromTrackMixEvent = results.fromTrackMixEvent;
      transitionMixEvent = results.transitionMixEvent;
      toTrackMixEvent = results.toTrackMixEvent;
    });

    describeAttrs('transitionMixEvent', {
      subject() { return transitionMixEvent; },
      hasTransition: true,
      fromTrackIsValid: true,
      toTrackIsValid: true,
      timesAreValid: true,
      isValid: true,
      isValidTransition: true,
    });
  });

  // TODO(TEST)
  describe.skip('with conflicting prevTransition', function() {
  });
  describe.skip('with conflicting nextTransition', function() {
  });
  describe.skip('with invalid fromTrackMixEvent', function() {
  });
  describe.skip('with valid fromTrackMixEvent', function() {
  });
  describe.skip('with invalid toTrackMixEvent', function() {
  });
  describe.skip('with valid toTrackMixEvent', function() {
  });

  describe.skip('with valid mixEvent', function() {

  });

  describe.skip('with invalid mixEvent', function() {

  });
});
