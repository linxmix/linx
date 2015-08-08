import _ from 'npm:underscore';

import {
  beforeEach,
  afterEach,
} from 'mocha';

import * as modules from '../mocks/index';

const DEFAULTS = {
  type: 'GET',
  logging: true,
  responseTime: 100
};

// TODO: why the false positives?
// $.mockjaxSettings.throwUnmocked = true;

export default function() {
  let mockIds = [];

  beforeEach(function() {
    let mocks = Object.keys(modules).without('default').map((moduleKey) => {
      return buildMock(modules[moduleKey]);
    });
    mockIds = mocks.map((mock) => {
      // console.log("SETUP MOCK", mock);
      return $.mockjax(mock);
    });
  });

  afterEach(function() {
    mockIds.map(function(mockId) {
      $.mockjax.clear(mockId);
    });
  });
}

function buildMock(module) {
  return _.extend({}, DEFAULTS, module);
}
