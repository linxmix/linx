import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import ENV from 'linx/config/environment';

describe('SoundcloudTrackModel', function() {
  setupTestEnvironment();

  describe('fetching track by id from soundcloud', function() {
    let soundcloudTrack;

    beforeEach(function() {
      this.timeout(5000); // give soundcloud API time

      // don't hit their API more times than necessary
      let promise;
      if (!soundcloudTrack) {
        promise = this.store.find('soundcloudTrack', '89087927').then((model) => {
          soundcloudTrack = model;
        });
      }

      wait(promise);
    });

    it('fetched soundcloud track', function() {
      expect(soundcloudTrack).to.be.an('object');
      expect(soundcloudTrack.constructor.modelName).to.equal('soundcloud/track');
    });

    describeAttrs('soundcloudTrack', {
      subject() { return soundcloudTrack; },
      title: 'Bolt (Original Mix)',
      genre: 'Progressive House',
      description: 'Here\'s beatfn\'s newest original mix, Bolt.\r\n\r\nEnjoy the track, and support us if you like it! \r\n\r\nCheck out more from beatfn at our website http://beatfn.com',
      duration: 444985,
      streamable: true,
      streamUrl: `https://api.soundcloud.com/tracks/89087927/stream?client_id=${ENV.SC_KEY}`,
    });
  });

  describe('fetching tracks with query from soundcloud', function() {
    let models;

    beforeEach(function() {
      this.timeout(5000); // give soundcloud API time

      // don't hit their API more times than necessary
      let promise;
      if (!models) {
        promise = this.store.query('soundcloudTrack', { q: 'beatfn' }).then((_models) => {
          models = _models;
        });
      }

      wait(promise);
    });

    it('fetched tracks', function() {
      expect(models.get('length')).to.be.gt(0);
    });

    it('fetched tracks of correct model type', function() {
      models.mapBy('constructor.modelName').forEach((modelName) => {
        expect(modelName).to.equal('soundcloud/track');
      });
    });
  });
});
