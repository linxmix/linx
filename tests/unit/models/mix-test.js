import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import Mix from 'linx/models/mix';

describe.only('it exists', function(assert) {
  // var store = this.store();
  assert.ok(!!Mix);
});
