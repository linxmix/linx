import Ember from 'ember';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';

import {
  beforeEach,
  afterEach,
} from 'mocha';

import customHelpers from './custom-helpers';
import seedStore from './seed-store';
import setupSinonSandbox from './setup-sinon-sandbox';
import setupApiMocks from './setup-api-mocks';

export default function startApp(attrs) {
  setupSinonSandbox();
  setupApiMocks();
  var application;

  beforeEach(function() {
    var attributes = Ember.merge({}, config.APP);
    attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

    Ember.run(function() {
      application = Application.create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    seedStore();
  });

  afterEach(function() {
    Ember.run(application, 'destroy');
  });
}
