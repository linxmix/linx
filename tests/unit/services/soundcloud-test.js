import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import describeAttrs from 'linx/tests/helpers/describe-attrs';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

import {
  default as SoundcloudService,
  REST_VERBS
} from 'linx/services/soundcloud';
import { asResolvedPromise } from 'linx/lib/utils';

describe('SoundcloudService', function() {
  setupTestEnvironment();

  let service;

  beforeEach(function() {
    service = SoundcloudService.create();
  });

  it('has rest methods', function() {
    REST_VERBS.forEach((verb) => {
      expect(service).to.respondTo(`${verb}Ajax`);
    });
  }),

  it('service is not ready by default', function() {
    expect(service.get('isReady')).to.be.false;
  });

  it('service is not authenticated by default', function() {
    expect(service.get('isAuthenticated')).to.be.false;
  });

  describe('#_loadSdk', function() {
    let sdk, promise;

    beforeEach(function() {
      promise = service._loadSdk().then((_sdk) => {
        sdk = _sdk;
      });

      wait(promise);
    });

    it('returns a promise', function() {
      expect(promise).to.be.an.instanceOf(Ember.RSVP.Promise);
    });

    it('promise resolves into SDK object', function() {
      expect(sdk).to.be.an('object');
    });

    it('service is ready', function() {
      expect(service.get('isReady')).to.be.true;
    });

    describe('soundcloud SDK object', function() {
      REST_VERBS.concat(['connect']).forEach((verb) => {
        it(`SDK responds to ${verb}`, function() {
          expect(sdk).to.respondTo(verb);
        });
      });
    });
  });

  describe('with loaded sdk', function() {
    let sdk, loadStub;

    beforeEach(function() {
      sdk = Ember.Object.create();

      REST_VERBS.forEach((verb) => {
        sdk[verb] = this.sinon.stub().callsArg(2);
      });

      loadStub = this.sinon.stub(service, '_loadSdk').returns(asResolvedPromise(sdk));

      Ember.run(() => {
        service.set('isSdkLoaded', true);
      });
    });

    it('service is not authenticated', function() {
      expect(service.get('isAuthenticated')).to.be.false;
    });

    describe('#_authenticateSdk', function() {
      let promise, connectStub;

      beforeEach(function() {
        let connectStub = sdk.connect = this.sinon.stub().callsArg(0);

        promise = service._authenticateSdk(sdk);
        wait(promise);
      });

      it('returns a promise', function() {
        expect(promise).to.be.an.instanceOf(Ember.RSVP.Promise);
      });

      it('calls sdk.connect', function() {
        expect(sdk.connect.calledOnce).to.be.true;
      });

      it('service isAuthenticated after authentication', function() {
        expect(service.get('isAuthenticated')).to.be.true;
      });
    });

    describe('rest API', function() {
      let restStub;

      beforeEach(function() {
        restStub = this.sinon.stub(service, '_rest').returns(asResolvedPromise());
      });

      REST_VERBS.forEach((verb) => {
        let methodName = `${verb}Ajax`;

        it(`${methodName} calls service.rest with correct verb, url and options`, function() {
          let testUrl = 'test/url.tst';
          let testOptions = {
            option1: 1,
            option2: 2,
          };

          wait(service[methodName](testUrl, testOptions));

          andThen(() => {
            expect(restStub.calledOnce).to.be.true;
            expect(restStub.calledWith(verb, testUrl, testOptions)).to.be.true;
          });
        });
      });
    });

    describe('#_rest', function() {
      let authStub;

      beforeEach(function() {
        authStub = this.sinon.stub(service, '_authenticateSdk', function() {
          service.set('isAuthenticated', true);
          return asResolvedPromise();
        });
      });

      it('when called with get, does not call _authenticateSdk', function(done) {
        service._rest('get').then(() => {
          expect(authStub.called).to.be.false;
          done();
        });
      });

      it('when not authed and not called with get, does call _authenticateSdk', function(done) {
        service._rest('post').then(() => {
          expect(authStub.calledOnce).to.be.true;
          done();
        });
      });

      it('when authed and not called with get, does not call _authenticateSdk', function(done) {
        Ember.run(() => {
          service.set('isAuthenticated', true);
        });

        service._rest('post').then(() => {
          expect(authStub.called).to.be.false;
          done();
        });
      });
    });
  });
});
