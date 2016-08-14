import Ember from 'ember';

import MixVisualClipMixin from 'linx/mixins/components/mix-visual/clip';
import ArrangementVisualClip from 'linx/components/arrangement-visual/clip';

import { constantTernary } from 'linx/lib/computed/ternary';

export default ArrangementVisualClip.extend(
  MixVisualClipMixin, {

  // overrides
  layoutName: 'components/arrangement-visual/clip',

  height: Ember.computed.reads('fullHeight'),
  row: 0,
  isDraggable: Ember.computed.reads('isSelectedTransitionClip'),
  isResizable: Ember.computed.reads('isSelectedTransitionClip'),

  transition: Ember.computed.reads('clip.transition'),
  fromTrackClip: Ember.computed.reads('clip.fromTrackClip'),
  toTrackClip: Ember.computed.reads('clip.toTrackClip'),

  // used to keep track of where things were when drag started
  _dragStartBeat: 0,
  _resizeStartValue: 0,

  actions: {
    onClick() {
      if (!this.get('isSelectedTransitionClip')) {
        this.sendAction('selectTransition', this.get('transition'));

        // TODO(TECHDEBT): why does this not work?
        const event = Ember.get(d3, 'event.sourceEvent') || Ember.get(d3, 'event');
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    },

    onDrag(d3Context, d, dBeats) {
      dBeats = this.attrs.quantizeBeat(dBeats);
      const newBeat = this.get('_dragStartBeat') + dBeats;
      const fromTrackClip = this.get('fromTrackClip');

      Ember.run.throttle(fromTrackClip, fromTrackClip.set, 'audioEndBeat', newBeat, 10, true);
    },

    onDragStart(d3Context, d) {
      this.set('_dragStartBeat', this.get('fromTrackClip.audioEndBeat'));
    },

    // TODO(TECHDEBT): resize isnt implemented well
    onResizeRight(d3Context, d, dBeats) {
      dBeats = this.attrs.quantizeBeat(dBeats);
      const newBeatCount = this.get('_resizeStartValue') + dBeats;
      const newEndBeat = this.get('_resizeFromTrackClipEndBeat') + dBeats;
      const fromTrackClip = this.get('fromTrackClip');
      const transition = this.get('transition');

      transition.set('beatCount', Math.max(newBeatCount, 0));
      fromTrackClip.set('audioEndBeat', newEndBeat);
    },

    onResizeLeft(d3Context, d, dBeats) {
      dBeats = this.attrs.quantizeBeat(dBeats);
      const newBeatCount = this.get('_resizeStartValue') - dBeats;
      const newStartBeat = this.get('_resizeToTrackClipStartBeat') + dBeats;
      const toTrackClip = this.get('toTrackClip');
      const transition = this.get('transition');

      transition.set('beatCount', Math.max(newBeatCount, 0));
      toTrackClip.set('audioStartBeat', newStartBeat);
    },

    onResizeStart(d3Context, d) {
      this.set('_resizeStartValue', this.get('transition.beatCount'));
      this.set('_resizeFromTrackClipEndBeat', this.get('fromTrackClip.audioEndBeat'));
      this.set('_resizeToTrackClipStartBeat', this.get('toTrackClip.audioStartBeat'));
    },
  },


  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualTransitionClip', true);
  },
});
