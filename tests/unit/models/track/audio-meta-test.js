import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from 'linx/models/track/audio-meta/marker';

describe('AudioMetaModel', function() {
  setupTestEnvironment();

  let audioMeta, echonestTrack, analysis;

  beforeEach(function() {
    audioMeta = this.factory.make('track/audio-meta');
    echonestTrack = this.factory.make('echonest/track-giveitupforlove');

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

  describe('after processing analysis', function() {
    describeAttrs('audioMeta', {
      subject() { return audioMeta; },
      isNew: false,
      duration() { return analysis.get('duration'); },
      bpm() { return analysis.get('bpm'); },
      timeSignature() { return analysis.get('timeSignature'); },
      key() { return analysis.get('key'); },
      mode() { return analysis.get('mode'); },
      loudness() { return analysis.get('loudness'); },

      startBeat: -0.29966005267229856,
      startBar: -0.07491501316807464,
      endBeat() { return audioMeta.get('beatCount') - Math.abs(audioMeta.get('startBeat')); },
      beatCount: 783.7039690866668,

      firstWholeBeat: 0,
      firstWholeBar: 0,
      lastWholeBeat: 776,
      lastWholeBar: 194,

      // TODO(MULTIGRID): this needs to change
      'sortedGridMarkers.length': 1,
      'sortedSectionMarkers.length': function() { return analysis.get('confidentSections.length'); },
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
  });
});
