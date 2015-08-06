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
      'model:track',
      'model:audio-meta',
      'model:marker',
    ]
  },
  function() {

  startApp();

  let store, track1, audioMeta1;

  beforeEach(function() {
    console.log('audio meta test before each');
    console.log('serve', server);
    store = this.store();
  });

  it('is ok', function() {
    debugger
  });
});
