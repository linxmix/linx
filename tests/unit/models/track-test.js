import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

describe('TrackModel', function() {
  setupTestEnvironment();

  let track;

  beforeEach(function() {
    track = this.factory.make('giveitupforlove', 'withoutAudioMeta');
  });

  // there are mockjaxes setup for upload to, profile from, and analysis from echonest
  describe('fetching audio-meta', function() {
    let echonestTrack, audioMeta;

    beforeEach(function() {
      wait(track.get('audioMeta').then((result) => {
        audioMeta = result;
        echonestTrack = track.get('echonestTrack.content');
      }));
    });

    it('fetched echonest/track', function() {
      let store = this.store;
      expect(echonestTrack).to.be.ok;
      expect(echonestTrack.get('id')).to.equal('TRAWOGC14E8320817F');
    });

    it('fetched audio-meta', function() {
      expect(audioMeta).to.be.ok;
      expect(audioMeta.get('track.id')).to.equal(track.get('id'));
    });
  });
});
