/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import { beforeEach, describe } from 'mocha';
import hbs from 'htmlbars-inline-precompile';

import makeTrackClip from 'linx/tests/helpers/make-track-clip';
import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

describeComponent(
  'track-clip',
  'Integration: TrackClipComponent',
  {
    integration: true
  },
  function() {
    setupUnitTest();

    let track, trackClip, pxPerBeat, syncBpm, seekBeat;

    beforeEach(function() {
      let results = makeTrackClip.call(this);
      track = results.track;
      trackClip = results.trackClip;

      pxPerBeat = 15; syncBpm = 28; seekBeat = 10;

      this.setProperties({
        trackClip,
        pxPerBeat,
        syncBpm,
        seekBeat,
      });

      this.render(hbs`
        {{track-clip
          clip=trackClip
          pxPerBeat=pxPerBeat
          syncBpm=syncBpm
          seekBeat=seekBeat
        }}
      `);
    });

    it('renders', function() {
      expect(this.$()).to.have.length(1);
    });

    // it('has correct startPx', function() {
    //   expect(component.get('startPx')).to.equal(0);
    // });
  }
);
