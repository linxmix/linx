import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

describe.only('AudioMeta', function() {
  setupUnitTest();

  beforeEach(function() {
    console.log('audio meta test before each');
    var track = this.factory.make('giveitupforlove');
    wait(track.get('audioMeta'));
  });

  it('is ok', function() {
    expect(this.store.peekAll('track').get('length')).to.equal(1);
  });
});
