import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import WaaClock from 'npm:waaclock';

import describeAttrs from 'linx/tests/helpers/describe-attrs';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

import { default as Clock, ClockEvent } from 'linx/lib/clock';
import { asResolvedPromise } from 'linx/lib/utils';

describe.skip('ClockEvent', function() {
  setupTestEnvironment();

  let clock, waaClock, dummyContext;

  beforeEach(function() {
    dummyContext = {
      currentTime: 0
    };

    // TODO: need a good way to stub this
    // stub Clock._clock with manually ticking clock
    clock = Clock.create(dummyContext);
    waaClock = new WAAClock(dummyContext, { tickMethod: 'manual' });
    clock.set('_clock', waaClock);
    waaClock.start();
  });
});
