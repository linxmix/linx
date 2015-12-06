/* jshint expr:true */
import hbs from 'htmlbars-inline-precompile';
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import { beforeEach, describe } from 'mocha';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

describeComponent.skip(
  'track-clip',
  'Integration: TrackClipComponent',
  {
    integration: true
  },
  function() {
    setupTestEnvironment();

    let track, trackClip, pxPerBeat, syncBpm, seekBeat;

    beforeEach(function() {
      // let results = makeTrackClip.call(this);
      let results;
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
