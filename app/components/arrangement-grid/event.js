import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import subtract from 'linx/lib/computed/subtract';
import { propertyOrDefault } from 'linx/lib/computed/ternary';

export default Ember.Component.extend(
  RequireAttributes('metronome', 'clip', 'sinkNode', 'pxPerBeat'), {

  classNames: ['ArrangementGridEvent'],
  attributeBindings: ['componentStyle:style', 'draggable'],
  classNameBindings: ['isDraggable'],

  //
  // Event Logic
  //
  clipEvent: null,
  eventDidChange: Ember.observer('metronome', 'clip', function() {
    Ember.run.once(this, 'updateClipEvent');
  }),

  updateClipEvent() {
    this.destroyClipEvent();
    let clipEvent = ClipEvent.create(this.getProperties('clip', 'metronome'));
    this.set('clipEvent', clipEvent);
  },

  destroyClipEvent: function() {
    console.log("destroy clip event");
    let clipEvent = this.get('clipEvent');
    clipEvent && clipEvent.destroy();
  }.on('willDestroyElement'),

  //
  // View Logic
  //
  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'widthPx',
  }),

  // TODO: refactor into draggable mixin?
  isDraggable: false,
  draggable: Ember.computed.reads('isDraggable'),

  getHoverBeat(e) {
    if (!e) { return; }

    let $this = this.$();
    let offsetX = e.originalEvent.pageX - $this.offset().left;

    return offsetX / this.get('pxPerBeat');
  },

  // dragStart(e) {
  //   e.originalEvent.dataTransfer.setDragImage('', 10, 10);
  // },

  drag(e) {
    Ember.run.throttle(this, '_drag', e, 50, true);
  },

  _drag(e = {}) {
    let originalEvent = e.originalEvent;
    let { x, y } = originalEvent;

    // ignore final drag event because it's at 0,0 (why?)
    if (!(x === 0 && y === 0)) {
     this.sendAction('onDrag', this.getHoverBeat(e));
    }
  },

  startPx: function() {
    return this.beatToPx(this.get('clip.startBeat')) + 'px';
  }.property('clip.startBeat', 'pxPerBeat'),

  endPx: function() {
    return this.beatToPx(this.get('clip.endBeat')) + 'px';
  }.property('clip.endBeat', 'pxPerBeat'),

  widthPx: function() {
    return this.beatToPx(this.get('clip.beatCount')) + 'px';
  }.property('clip.beatCount', 'pxPerBeat'),

  beatToPx: function(beat) {
    return beat * this.get('pxPerBeat'); // beat * (px / beat) = px
  },
});

// binds a clip to a metronome as a ClipEvent
// exposes isPlaying, isFinished, seekBeat and bpm.
export const ClipEvent = Ember.Object.extend(
  RequireAttributes('clip', 'metronome'), {

  // params
  startBeat: Ember.computed.reads('clip.startBeat'),
  endBeat: Ember.computed.reads('clip.endBeat'),
  beatCount: Ember.computed.reads('clip.beatCount'),
  syncBpm: Ember.computed.reads('bpm'),
  tick: propertyOrDefault('isPlaying', 'metronome.tick', 0),
  isPlaying: false,
  isFinished: false,

  // absSeekBeat clamped within this clip's bounds
  seekBeat: Ember.computed('seekBeat', 'beatCount', 'isFinished', function() {
    let { seekBeat, beatCount } = this.getProperties('seekBeat', 'beatCount');

    if (isFinished) {
      return beatCount;
    } else {
      return clamp(0, seekBeat, beatCount);
    }
  }),
  // current metronome seekBeat from clipEvent's frame of reference
  absSeekBeat: subtract('metronome.seekBeat', 'startBeat'),

  // returns current beat from this event's frame of reference
  getCurrentBeat() {
    let currentBeat = this.get('metronome').getCurrentBeat() - this.get('startBeat');
    return clamp(0, currentBeat, this.get('beatCount'));
  },

  _schedulingDidChange: function() {
    Ember.run.once(this, '_updateEventTimes');
  }.observes('metronome.isPlaying', 'metronome.absSeekTime', 'startBeat', 'syncBpm', 'endBeat', 'beatCount').on('init'),

  _updateEventTimes: function() {
    let metronome = this.get('metronome');
    let seekTime = beatToTime(this.get('absSeekBeat'), this.get('syncBpm'));
    let duration = beatToTime(this.get('beatCount'), this.get('syncBpm'));
    let metronomeIsPlaying = metronome.get('isPlaying');

    // if metronome is paused or jumped back, pause this
    if (!(metronomeIsPlaying && seekTime >= 0)) {
      this.set('isPlaying', false);
    }

    // if seeking before clip end, set isFinished to false
    let currentMetronomeBeat = metronome.getCurrentBeat();
    let isFinished = currentMetronomeBeat >= this.get('endBeat');
    if (!isFinished) {
      this.set('isFinished', false);
    }

    // update events
    let startEvent = this.get('_startEvent');
    let endEvent = this.get('_endEvent');
    let absStartTime = metronome.getCurrentAbsTime() - seekTime;
    let absEndTime = absStartTime + duration;

    startEvent.setProperties({
      deadline: absStartTime,
      isScheduled: !isFinished && metronomeIsPlaying,
    });

    endEvent.setProperties({
      deadline: absEndTime,
      isScheduled: metronomeIsPlaying
    });
  },

  _startEvent: Ember.computed('metronome', function() {
    return this.get('metronome').createEvent({
      onExecute: this._executeStart.bind(this),
    });
  }),

  _endEvent: Ember.computed('metronome', function() {
    return this.get('metronome').createEvent({
      onExecute: this._executeEnd.bind(this),
    });
  }),

  _executeStart(delay) {
    // console.log("_executeStart", this.get('clip.model.title'), delay);
    this.setProperties({
      isPlaying: true,
      isFinished: false,
    });
  },

  _executeEnd(delay) {
    // console.log("_executeEnd", this.get('clip.model.title'), delay);
    this.setProperties({
      isPlaying: false,
      isFinished: true,
    });
  },

  destroy() {
    this.get('_startEvent').destroy();
    this.get('_endEvent').destroy();
    this._super.apply(this, arguments);
  }
});
