import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from 'linx/models/marker';

describe('AudioMeta', function() {
  setupTestEnvironment();

  let audioMeta, echonestTrack, analysis;

  beforeEach(function() {
    audioMeta = this.factory.make('audio-meta');
    echonestTrack = this.factory.make('echonest-track-giveitupforlove');

    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('marker');
    // this.factoryHelper.handleUpdate(audioMeta, { id: audioMeta.get('id') });

    // only fetch analysis once
    if (!analysis) {
      wait(echonestTrack.get('analysis').then((result) => {
        analysis = result;
        return audioMeta.processAnalysis(analysis);
      }));
    } else {
      wait(audioMeta.processAnalysis(analysis));
    }
  });

  describe('processing analysis', function() {
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
      expect(fadeInMarker).to.be.ok;
      expect(fadeInMarker.get('start')).to.equal(analysis.get('endOfFadeIn'));
      expect(fadeInMarker.get('type')).to.equal(FADE_IN_MARKER_TYPE);
    });

    it('has correct fade out marker', function() {
      let fadeOutMarker = audioMeta.get('fadeOutMarker');
      expect(fadeOutMarker).to.be.ok;
      expect(fadeOutMarker.get('start')).to.equal(analysis.get('startOfFadeOut'));
      expect(fadeOutMarker.get('type')).to.equal(FADE_OUT_MARKER_TYPE);
    });

    it('has correct sortedGridMarkers', function() {
      expect(audioMeta.get('sortedGridMarkers.length')).to.equal(1);
    });

    it('has correct sortedSectionMarkers', function() {
      expect(audioMeta.get('sortedSectionMarkers.length')).to.equal(10);
    });

    it('has correct numBeats', function() {
      expect(audioMeta.get('numBeats')).to.be.closeTo(783.7039690866668, 0.0005);
    });
  });
});
