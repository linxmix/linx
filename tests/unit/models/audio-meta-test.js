import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { describeModel } from 'ember-mocha';
import { expect } from 'chai';

import startApp from 'linx/tests/helpers/start-app';

describeModel.only('audio-meta', 'AudioMeta',
  {
    needs: [
      'model:audio-meta',
      'model:marker',
    ]
  },
  function() {

  startApp();

  beforeEach(function() {
    console.log('audio meta test before each');
    console.log('serve', server);
    var store = this.store();
  });

  it('is ok', function() {
    expect(true).to.be.true;
  });
});
