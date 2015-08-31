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
import makeTransitionClip from 'linx/tests/helpers/make-transition-clip';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe.skip('MixClipModel', function() {
  setupUnitTest();

  // TODO(TEST): make this work.

  beforeEach(function() {
    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('transition-mix-event');
  });

  describeAttrs('empty transitionClip', {
    subject() { return this.factory.make('transition-clip'); },
    hasTransition: false,
    fromTrackIsValid: false,
    toTrackIsValid: false,
    timesAreValid: false,
    isValid: false,
    isValidTransition: false,
  });

  describe('with valid fromTrackClip and toTrackClip', function() {
    let fromTrackClip, transitionClip, toTrackClip;

    beforeEach(function() {
      let results = makeTransitionClip.call(this);
      fromTrackClip = results.fromTrackClip;
      toTrackClip = results.toTrackClip;
      transitionClip = results.transitionClip;
    });

    describeAttrs('transitionClip', {
      subject() { return transitionClip; },
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
  describe.skip('with invalid fromTrackClip', function() {
  });
  describe.skip('with valid fromTrackClip', function() {
  });
  describe.skip('with invalid toTrackClip', function() {
  });
  describe.skip('with valid toTrackClip', function() {
  });

  describe.skip('with valid mixEvent', function() {

  });

  describe.skip('with invalid mixEvent', function() {

  });
});
