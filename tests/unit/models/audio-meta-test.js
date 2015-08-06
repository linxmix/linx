import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

describe('AudioMeta', function() {
  setupUnitTest();

  beforeEach(function() {
    console.log('audio meta test before each');
    var track = this.factory.make('giveitupforlove');
    track.get('audioMeta').then(function() {
      console.log("got audio meta", arguments);
    });
  });

  it('is ok', function() {
    expect(this.store.peekAll('track').get('length')).to.equal(1);
    debugger
  });
});
