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

describe('ClockEvent', function() {
  setupTestEnvironment();

  let clock, waaClock, dummyContext, tick;

  beforeEach(function() {
    dummyContext = {
      currentTime: 0
    };

    // TODO: need a good way to stub this
    // stub Clock._clock with manually ticking clock
    clock = Clock.create({ audioContext: dummyContext });
    waaClock = new WaaClock(dummyContext, { tickMethod: 'manual' });
    clock.set('_clock', waaClock);
    waaClock.start();

    tick = function(n) {
      if (n !== undefined) {
        dummyContext.currentTime += n;
      }

      clock.tick();
    };
  });

  describe('with simple deadline', function() {
    let clockEvent, deadline, executeStub;

    beforeEach(function() {
      deadline = 5;
      executeStub = this.sinon.stub();

      clockEvent = clock.createEvent({
        deadline,
        isScheduled: true,
        onExecute: executeStub,
      });
    });

    it('triggers on time', function() {
      tick(deadline);

      expect(executeStub.calledOnce).to.be.true;
    });

    it('triggers if scheduled past time', function() {
      Ember.run(() => {
        clockEvent.set('isScheduled', false);
      });
      tick(deadline);
      Ember.run(() => {
        clockEvent.set('isScheduled', true);
      });

      expect(executeStub.calledOnce).to.be.true;
    });

    it('triggers if deadline changed to prev time', function() {
      Ember.run(() => {
        clockEvent.set('deadline', -2);
      });

      expect(executeStub.calledOnce).to.be.true;
    });

    it('does not trigger when not isScheduled', function() {
      Ember.run(() => {
        clockEvent.set('isScheduled', false);
      });

      expect(executeStub.called).to.be.false;
    });

    describe('with repeat interval', function() {
      let interval;

      beforeEach(function() {
        interval = 1;
        Ember.run(() => {
          clockEvent.set('repeatInterval', interval);
        });
      });

      it('isRepeatingEvent', function() {
        expect(clockEvent.get('isRepeatingEvent')).to.be.true;
      });

      it('triggers at start', function() {
        tick(deadline);

        expect(executeStub.calledOnce).to.be.true;
      });

      it('triggers for each tick interval', function() {
        tick(deadline);
        tick(interval);
        expect(executeStub.calledTwice).to.be.true;
        tick(interval);
        expect(executeStub.calledThrice).to.be.true;
      });

      it('does not trigger retroactively for missed tick intervals', function() {
        tick(deadline + interval);
        expect(executeStub.calledOnce).to.be.true;
      });

      it('executes if updating repeatInterval after deadline', function() {
        tick(deadline);
        Ember.run(() => {
          clockEvent.cancelRepeat();
        });

        expect(executeStub.calledTwice).to.be.true;
      });

      it('does not execute if updating repeatInterval after deadline', function() {
        Ember.run(() => {
          clockEvent.cancelRepeat();
        });

        expect(executeStub.called).to.be.false;
      });

      it('can cancel by unsetting repeatInterval', function() {
        tick(deadline);
        Ember.run(() => {
          clockEvent.cancelRepeat();
        });
        tick(interval);

        // called once for deadline, once for cancelRepeat
        expect(executeStub.calledTwice).to.be.true;
      });

      it('can live update repeatInterval', function() {
        tick(deadline);
        Ember.run(() => {
          clockEvent.set('repeatInterval', interval * 2);
        });
        tick(interval * 2);

        // called once for deadline, once for updating interval, once for tick
        expect(executeStub.calledThrice).to.be.true;
      });
    });
  });
});
