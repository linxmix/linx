import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

describe.only('Track', function() {
  setupUnitTest();

  let track;

  beforeEach(function() {
    track = this.factory.make('giveitupforlove');
  });

  describe('fetching audio-meta', function() {
    let echonestTrack, audioMeta;

    beforeEach(function() {
      wait(track.get('audioMeta').then((result) => {
        audioMeta = result;
        echonestTrack = track.get('echonestTrack');
      }));
    });

    it('fetched echonest-track', function() {
      expect(echonestTrack).to.be.ok;
      expect(echonestTrack.get('id')).to.equal('TRAWOGC14E8320817F');
    });

    it('fetched audio-meta', function() {
      expect(audioMeta).to.be.ok;
      expect(audioMeta.get('track.id')).to.equal(track.get('id'));
    });

  });

});
