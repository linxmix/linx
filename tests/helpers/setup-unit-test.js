import Ember from 'ember';
import setupSinonSandbox from './setup-sinon-sandbox';
import setupApiMocks from './setup-api-mocks';
import { default as FactoryGuy, make } from 'ember-data-factory-guy';

export default function() {
  setupApiMocks();
  setupSinonSandbox();

  beforeEach(function() {
    this.store = FactoryGuy.getStore();
    this.factory = FactoryGuy;
  });
}
