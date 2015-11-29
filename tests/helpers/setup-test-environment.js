import Ember from 'ember';

import { default as FactoryGuy, make } from 'ember-data-factory-guy';
import FactoryGuyTestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import {
  beforeEach,
  afterEach,
} from 'mocha';

import setupWebAudioStub from 'linx/tests/helpers/setup-web-audio-stub';
import startApp from 'linx/tests/helpers/start-app';

function setProperties() {
  this.store = FactoryGuy.getStore();
  this.factory = FactoryGuy;
  this.factoryHelper = FactoryGuyTestHelper;
  this.container = this.store.get('container');
}

export default function() {
  startApp();
  setupWebAudioStub();

  beforeEach(setProperties);

  afterEach(function(done) {
    // TODO(DBSTUB)
    // reset firebase
    this.timeout(5000);
    this.container.lookup('service:firebase').remove(done);
  });
}
