import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import BufferSourceNode from 'linx/lib/web-audio/buffer-source-node';

describe('WebAudioBufferSourceNode', function() {
  setupTestEnvironment();

  let node;

  beforeEach(function() {
    node = BufferSourceNode.create({ audioContext: this.audioContext });
  });

  it('exists', function() {
    expect(node).to.be.ok;
  });

  describe('#start', function() {
    let startStub, createBufferSourceStub, webAudioNode;
    let when, offset, duration;

    beforeEach(function() {
      webAudioNode = Ember.Object.create({
        start: () => {},
      });
      startStub = this.sinon.stub(webAudioNode, 'start');
      createBufferSourceStub = this.sinon.stub(node, 'createBufferSource').returns(webAudioNode);
    });

    describe('with sane arguments', function() {
      beforeEach(function() {
        when = 0;
        offset = 0;
        duration = 10;

        Ember.run(node, 'start', when, offset, duration);
      });

      it('calls #createBufferSource', function() {
        expect(createBufferSourceStub.calledOnce).to.be.true;
      });

      it('calls start on underlying node with correct arguments', function() {
        expect(startStub.calledOnce).to.be.true;
        expect(startStub.calledWithExactly(when, offset, duration)).to.be.true;
      });
    });

    describe('with negative when', function() {
      beforeEach(function() {
        when = -3;
        offset = 5;
        duration = 10;

        Ember.run(node, 'start', when, offset, duration);
      });

      it('calls start on underlying node with correct arguments', function() {
        expect(startStub.calledOnce).to.be.true;
        expect(startStub.calledWithExactly(0, offset - when, duration)).to.be.true;
      });
    });
  });
});
