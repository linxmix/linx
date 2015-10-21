import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import Ember from 'ember';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

describe('Acceptance: MixesPage', function() {
  setupTestEnvironment();

  let mixes;

  beforeEach(function() {
    mixes = this.factory.makeList('mix', 4);
    visit('/mixes');
  });

  it('has correct path', function() {
    expect(currentPath()).to.equal('mixes');
  });

  it('shows mixes', function() {
    expect($('.MixesList')).to.be.visible;
    expect($('.MixesListItem')).to.have.length(mixes.get('length'));
  });

  it('can navigate to mix', function() {
    click('.MixesListItem:first');

    andThen(function() {
      expect(currentPath()).to.equal('mix');
      expect(currentURL().match(mixes.get('firstObject.id'))).to.be.ok;
    });
  });

  it('can create new mix', function() {
    click('.test-create-mix');

    andThen(() => {
      expect(this.store.peekAll('mix').get('length')).to.equal(mixes.get('length') + 1);
    });
  });
});
