import {
  beforeEach,
  afterEach,
} from 'mocha';

import sinon from 'sinon';

export default function() {
  beforeEach(function() {
    this.server = sinon.fakeServer.create();
    this.server.autoRespond = true;
  });

  afterEach(function() {
    this.server.restore();
  });
}
