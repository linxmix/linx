import Ember from 'ember';

import _ from 'npm:underscore';

import ArrangementVisualTrackClip from 'linx/components/arrangement-visual/track-clip';
import MixVisualClipMixin from 'linx/mixins/components/mix-visual/clip';

import { constantTernary, propertyOrDefault } from 'linx/lib/computed/ternary';
import { FROM_TRACK_COLOR, TO_TRACK_COLOR } from 'linx/components/mix-builder';
import { isValidNumber } from 'linx/lib/utils';

const MARKER_CLICK_WINDOW = 0.05; // [s] how close to a marker a click has to be

export default ArrangementVisualTrackClip.extend(
  MixVisualClipMixin, {

  // required params
  quantizeBeat: null,

  actions: {
    onClick() {
      if (this.get('selectedTransition')) {
        Ember.run.next(() => {
          this._checkForMarkerClick();
        });
        this.sendAction('selectClip', this.get('clip'));
      }
    },

    onDrag(d3Context, d, dBeats) {
      dBeats = this.attrs.quantizeBeat(dBeats);
      const newBeat = this.get('_dragStartBeat') - dBeats;
      const clip = this.get('clip');

      Ember.run.throttle(clip, clip.set, 'audioStartBeat', newBeat, 10, true);
    },

    onDragStart(d3Context, d) {
      this.set('_dragStartBeat', this.get('clip.audioStartBeat'));
    },
  },

  // if marker was clicked, set as beatgrid and clear markers
  _checkForMarkerClick() {
    const trackClip = this.get('clip.content');
    const currentAudioTime = trackClip.getCurrentAudioTime();
    const markers = trackClip.get('markers') || [];

    const marker = markers.find(({ time }) => {
      return (currentAudioTime - MARKER_CLICK_WINDOW <= time) &&
        (currentAudioTime + MARKER_CLICK_WINDOW >= time);
    });

    // TODO(TRACKMULTIGRID): refactor to use dynamic beatgrids instead of static time
    if (marker && isValidNumber(marker.time)) {
      console.log('clicked marker', marker);

      const arrangement = trackClip.get('arrangement.content');
      const quantizedBeat = arrangement.get('beatGrid').quantizeBeat(arrangement.getCurrentBeat());
      const quantizedAudioTime = trackClip.getAudioTimeFromArrangementBeat(quantizedBeat);

      const prevAudioStartTime = trackClip.get('audioStartTime');
      const timeDelta = quantizedAudioTime - marker.time;
      trackClip.set('audioStartTime', prevAudioStartTime - timeDelta);
      trackClip.set('markers', []);
    }
  },

  // used to keep track of where audio was when drag started
  _dragStartBeat: 0,

  layoutName: 'components/arrangement-visual/track-clip',

  // only to tracks in selected transition can be dragged (or first track)
  isDraggable: Ember.computed('selectedTransition', 'isSelectedToTrackClip', 'clip.mixItem.isFirstItem', function() {
    return this.get('selectedTransition') &&
      (this.get('isSelectedToTrackClip') || this.get('clip.mixItem.isFirstItem'));
  }),

  // display waveform only if no clip is selected, or this clip is in the selection
  displayWaveform: propertyOrDefault('selectedTransition', 'isInSelectedTransition', true),
  displayOverflowWaveform: Ember.computed.reads('isInSelectedTransition'),
  row: constantTernary('isSelectedToTrackClip', 2, 0),

  waveColor: Ember.computed('isSelectedFromTrackClip', 'isSelectedToTrackClip', function() {
    if (this.get('isSelectedFromTrackClip')) { return FROM_TRACK_COLOR; }
    if (this.get('isSelectedToTrackClip')) { return TO_TRACK_COLOR; }
    return 'steelblue';
  }),

  elementIndex: 0,
  _moveToFront(selection) {
    const $el = selection.node();
    const $parent = $el.parentNode;
    this.set('elementIndex', _.indexOf($parent.children, $el));
    $parent.appendChild($el);
  },

  _moveToIndex(selection) {
    const $el = selection.node();
    const $parent = $el.parentNode;
    $parent.insertBefore($el, $parent.children[this.get('elementIndex')]);
  },

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualTrackClip', true)
      // move element to top on hover
      .on('mouseover', this._moveToFront.bind(this, selection))
      .on('mouseout', this._moveToIndex.bind(this, selection));
  },
});
