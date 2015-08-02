import _ from 'npm:underscore';

import {
  beforeEach,
  afterEach,
} from 'mocha';

import modules from '../mocks/index';

const DEFAULTS = {
  type: 'GET',
  logging: false,
  contentType: 'application/json',
  responseTime: 0
};

export default function() {
  var mocks = [];

  beforeEach(function() {
    mocks = modules.map(buildMock)
      .map(function(mock) { return $.mockjax(mock); });
  });

  afterEach(function() {
    mocks.map(function(mock) {
      $.mockjax.clear(mock);
    });
  });
}

function buildMock(module) {
  return _.extend({}, DEFAULTS, module);
}
