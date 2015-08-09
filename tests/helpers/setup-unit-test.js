import Ember from 'ember';
import { default as FactoryGuy, make } from 'ember-data-factory-guy';
import FactoryGuyTestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import startApp from 'linx/tests/helpers/start-app';
import {
  beforeEach,
} from 'mocha';

export default function() {
  startApp();

  beforeEach(function() {
    this.store = FactoryGuy.getStore();
    this.factory = FactoryGuy;
    this.factoryHelper = FactoryGuyTestHelper;
    this.container = this.store.get('container');
  });
}
