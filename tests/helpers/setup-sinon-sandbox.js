import {
  beforeEach,
  afterEach,
} from 'mocha';

import sinon from 'sinon';

export default function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });
}
