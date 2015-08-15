import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

import {
  BEAT_MARKER_TYPE,
  BAR_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from 'linx/models/marker';

describe('AudioMeta', function() {
  setupUnitTest();

  let audioMeta;

  beforeEach(function() {
    audioMeta = this.factory.make('audio-meta');
  });

  describe('processing analysis', function() {
    let echonestTrack, analysis;

    beforeEach(function() {
      this.timeout(10000); // give the hardware ample time to process the analysis

      echonestTrack = this.factory.make('echonest-track-giveitupforlove');

      // TODO(DBSTUB)
      // this.factoryHelper.handleCreate('marker');
      // this.factoryHelper.handleUpdate(audioMeta, { id: audioMeta.get('id') });

      wait(echonestTrack.get('analysis').then((result) => {
        analysis = result;
        return audioMeta.processAnalysis(analysis);
      }));
    });

    it('saves after processing echonest analysis', function() {
      expect(audioMeta.get('isNew')).to.be.false;
    });

    it('has correct audio metadata', function() {
      expect(audioMeta.get('duration')).to.equal(analysis.get('duration'));
      expect(audioMeta.get('bpm')).to.equal(analysis.get('bpm'));
      expect(audioMeta.get('timeSignature')).to.equal(analysis.get('timeSignature'));
      expect(audioMeta.get('key')).to.equal(analysis.get('key'));
      expect(audioMeta.get('mode')).to.equal(analysis.get('mode'));
      expect(audioMeta.get('loudness')).to.equal(analysis.get('loudness'));
    });

    it('has correct fade in marker', function() {
      let fadeInMarker = audioMeta.get('fadeInMarker');
      expect(fadeInMarker.get('start')).to.equal(analysis.get('fadeInTime'));
      expect(fadeInMarker.get('type')).to.equal(FADE_IN_MARKER_TYPE);
    });

    it('has correct fade out marker', function() {
      let fadeOutMarker = audioMeta.get('fadeOutMarker');
      expect(fadeOutMarker.get('start')).to.equal(analysis.get('fadeOutTime'));
      expect(fadeOutMarker.get('type')).to.equal(FADE_OUT_MARKER_TYPE);
    });

    it('has correct first beat marker', function() {
      let firstBeatMarker = audioMeta.get('firstBeatMarker');
      expect(firstBeatMarker.get('start')).to.equal(analysis.get('firstBeatStart'));
      expect(firstBeatMarker.get('type')).to.equal(BEAT_MARKER_TYPE);
    });

    it('has correct last beat marker', function() {
      let lastBeatMarker = audioMeta.get('lastBeatMarker');
      expect(lastBeatMarker.get('start')).to.equal(analysis.get('lastBeatStart'));
      expect(lastBeatMarker.get('type')).to.equal(BEAT_MARKER_TYPE);
    });

    it('has correct numBeats', function() {
      expect(audioMeta.get('numBeats')).to.equal(783);
    });
  });
});
