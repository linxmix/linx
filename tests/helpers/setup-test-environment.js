import Ember from 'ember';
import { default as FactoryGuy, make } from 'ember-data-factory-guy';
import FactoryGuyTestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import startApp from 'linx/tests/helpers/start-app';
import {
  beforeEach,
} from 'mocha';

function setProperties() {
  this.store = FactoryGuy.getStore();
  this.factory = FactoryGuy;
  this.factoryHelper = FactoryGuyTestHelper;
  this.container = this.store.get('container');
}

export default function() {
  startApp();
  beforeEach(setProperties);

  beforeEach(function(done) {
    // TODO(DBSTUB)
    // reset firebase
    this.timeout(5000);
    this.container.lookup('service:firebase').remove(done);
  });
}
