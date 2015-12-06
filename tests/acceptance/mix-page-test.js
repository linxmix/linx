import Ember from 'ember';

import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import { asResolvedPromise } from 'linx/lib/utils';

describe('Acceptance: MixPage', function() {
  setupTestEnvironment();

  let mix;

  beforeEach(function() {
    mix = this.factory.make('mix');

    visit(`/mixes/${mix.get('id')}`);
  });

  it('has correct path', function() {
    expect(currentPath()).to.equal('mix');
  });

  describe('saving mix', function() {
    it('shows save button', function() {
      expect($('.test-save-mix')).to.be.visible;
    });

    it('save is disabled with clean mix', function() {
      expect(mix.get('anyDirty')).to.be.false;
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

  describe.skip('adding items', function() {

  });

  describe.skip('with items', function() {
    let items, itemsLength = 10;

    beforeEach(function() {
      items = this.factory.makeList('mix/item', itemsLength);
      Ember.run(() => {
        mix.set('_mixItems', items);
      });
    });

    it('shows items', function() {
      expect($('.MixList')).to.be.visible;
      expect($('.MixListItem')).to.have.length(itemsLength);
    });

    it('shows items in correct order', function() {
      expect($('.MixListItem:nth(0)').text()).to.contain('1');
      expect($('.MixListItem:nth(1)').text()).to.contain('2');
      expect($('.MixListItem:nth(2)').text()).to.contain('3');
    });

    it.skip('can navigate to track items', function() {
      click('.MixListItem:nth(0) a');

      andThen(function() {
        expect(currentPath()).to.match(/track/);
        expect(currentURL().match(mix.objectAt(0).get('model.id'))).to.be.ok;
      });
    });

    it.skip('can navigate to transition items', function() {
      click('.MixListItem:nth(1) a');

      andThen(function() {
        expect(currentPath()).to.match(/transition/);
        expect(currentURL().match(mix.objectAt(1).get('model.id'))).to.be.ok;
      });
    });
  });
});
