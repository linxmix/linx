import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

import { assertPromise } from 'linx/lib/utils';

describe.skip('AudioMeta', function() {
  setupUnitTest();

  let echonestTrack, analysis, audioMeta;

  beforeEach(function() {
    this.timeout(5000); // give the hardware ample time to process the analysis

    echonestTrack = this.factory.make('echonest-track-giveitupforlove');
    audioMeta = this.factory.make('audio-meta');

    // stub marker save
    this.container.lookupFactory('model:marker').reopenClass({
      save() { console.log("marker save"); return assertPromise(this) }
    });

    // this.sinon.stub(audioMeta, 'save', assertPromise);

    wait(echonestTrack.get('analysis').then((result) => {
      analysis = result;
      return audioMeta.processAnalysis(analysis);
    }));
  });

  it('processed echonest analysis', function() {
    expect(audioMeta.save).to.have.been.called;
  });
});
