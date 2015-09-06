import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import Ember from 'ember';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import makeMix from 'linx/tests/helpers/make-mix';
import makeTrack from 'linx/tests/helpers/make-track';
import makeTransition from 'linx/tests/helpers/make-transition';

import { asResolvedPromise } from 'linx/lib/utils';

describe('Acceptance: MixPage', function() {
  setupTestEnvironment();

  let mix;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = results.mix;

    visit(`/mixes/${mix.get('id')}`);
  });

  it('has correct path', function() {
    expect(currentPath()).to.equal('mix.index');
  });

  describe('saving mix', function() {
    it('shows save button', function() {
      expect($('.test-save-mix')).to.be.visible;
    });

    it('save is disabled with clean mix', function() {
      expect(mix.get('hasDirtyAttributes')).to.be.false;
      expect($('.test-save-mix').hasClass('disabled')).to.be.true;
    });

    describe('with dirty mix', function() {
      beforeEach(function() {
        Ember.run(() => { mix.set('title', 'test title'); });
      });

      it('save is enabled', function() {
        expect(mix.get('hasDirtyAttributes')).to.be.true;
        expect($('.test-save-mix').hasClass('disabled')).to.be.false;
      });

      it('can save mix', function() {
        let saveStub = this.sinon.stub(mix, 'save', asResolvedPromise);
        click('.test-save-mix');

        andThen(() => {
          expect(saveStub.calledOnce).to.be.true;
        });
      });
    });
  });

  describe('deleting mix', function() {
    let deleteStub, confirmStub;

    beforeEach(function() {
      deleteStub = this.sinon.stub(mix, 'destroyRecord', asResolvedPromise);
      confirmStub = this.sinon.stub(window, 'confirm');
    });

    it('shows delete button', function() {
      expect($('.test-delete-mix')).to.be.visible;
    });

    it('shows confirm before deleting mix', function() {
      click('.test-delete-mix');

      andThen(() => {
        expect(confirmStub.calledOnce).to.be.true;
      });
    });

    it('canceling confirm does not delete mix', function() {
      confirmStub.returns(false);
      click('.test-delete-mix');

      andThen(() => {
        expect(confirmStub.calledOnce).to.be.true;
        expect(deleteStub.called).to.be.false;
      });
    });

    it('accepting confirm does delete mix', function() {
      confirmStub.returns(true);
      click('.test-delete-mix');

      andThen(() => {
        expect(confirmStub.calledOnce).to.be.true;
        expect(deleteStub.calledOnce).to.be.true;
      });
    });

  });

  describe('with track and transition items', function() {
    let track1, transition, track2;

    beforeEach(function() {
      track1 = makeTrack.call(this);
      track2 = makeTrack.call(this);

      let results = makeTransition.call(this, {
        fromTrack: track1,
        toTrack: track2,
      });

      transition = results.transition;

      wait(mix.appendTransitionWithTracks(transition));
    });

    it('shows items', function() {
      expect($('.MixList')).to.be.visible;
      expect($('.MixListItem')).to.have.length(mix.get('length'));
    });

    it.skip('shows items in order');

    it.skip('can navigate to items', function() {
      click('.MixesListItem:first');

      andThen(function() {
        expect(currentPath()).to.equal('mix.index');
        expect(currentURL().match(mix.get('firstObject.id'))).to.be.ok;
      });
    });
  });
});
