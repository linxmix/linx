/* jshint expr:true */
import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import Ember from 'ember';
import startApp from '../helpers/start-app';

describe('Acceptance: Test', function() {
  startApp();

  it('can visit /mixes', function() {
    visit('/mixes');

    andThen(function() {
      expect(currentPath()).to.equal('mixes');
    });
  });
});
