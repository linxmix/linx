import Ember from 'ember';
// import setupSinonSandbox from './setup-sinon-sandbox';
// import setupApiMocks from './setup-api-mocks';
import { default as FactoryGuy, make } from 'ember-data-factory-guy';
import startApp from 'linx/tests/helpers/start-app';

export default function() {
  // setupApiMocks();
  // setupSinonSandbox();
  startApp()

  beforeEach(function() {
    this.store = FactoryGuy.getStore();
    this.factory = FactoryGuy;
    this.container = this.store.get('container');
  });
}
