import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  RequireAttributes('arrangement', 'clip', 'pxPerBeat'), {

  classNames: ['ArrangementGridEvent'],
  attributeBindings: ['componentStyle:style', 'draggable'],
  classNameBindings: ['isDraggable'],

  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'widthPx',
  }),

  // params
  clipEvent: null,
  metronome: Ember.computed.reads('arrangement.metronome'),

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

  updateClipEvent: Ember.observer('metronome', 'clip', function() {
    Ember.run.once(this, '_updateClipEvent');
  }).on('init'),

  _updateClipEvent: function() {
    let clip = this.get('clip');
    let metronome = this.get('metronome');

    // re-sync clip and metronome
    if (!(metronome && clip)) {
      this.destroyClipEvent();
    } else {
      let { clipEvent, clipRepeatInterval } = this.getProperties('clipEvent', 'clipRepeatInterval');

      if (!clipEvent) {
        clipEvent = ClipEvent.create({})
      } else {
        clipEvent.set('clip', clip);
      }

      // TODO(AUTOMATION): let child component automation-clip handle this?
      clipEvent.set('repeatInterval', clipRepeatInterval);
      this.set('clipEvent', clipEvent);
    }
  },

  // for clips that need to have 'ticks'
  clipRepeatInterval: Ember.computed('clip', function() {
    let clipModelName = this.get('clip.modelName');

    // TODO(AUTOMATION)
    if (clipModelName === 'transition-clip') {
      return 0.05;
    }
  }),

  destroyClipEvent: function() {
    let clipEvent = this.get('clipEvent');

    clipEvent && clipEvent.destroy();

    this.set('clipEvent', undefined);
  }.on('willDestroyElement'),

  startPx: function() {
    return this.beatToPx(this.get('clip.startBeat')) + 'px';
  }.property('clip.startBeat', 'pxPerBeat'),

  endPx: function() {
    return this.beatToPx(this.get('clip.endBeat')) + 'px';
  }.property('clip.endBeat', 'pxPerBeat'),

  widthPx: function() {
    return this.beatToPx(this.get('clip.numBeats')) + 'px';
  }.property('clip.numBeats', 'pxPerBeat'),

  beatToPx: function(beat) {
    return beat * this.get('pxPerBeat'); // beat * (px / beat) = px
  },
});

// binds a clip to an arrangement as a ClipEvent
export const ClipEvent = Ember.Object.extend(
  RequireAttributes('clip', 'arrangement'), {

  // params
  metronome: Ember.computed.reads('arrangement.metronome'),
  clock: Ember.computed.reads('metronome.clock'),
  startBeat: Ember.computed.reads('clip.startBeat'),
  endBeat: Ember.computed.reads('clip.endBeat'),
  numBeats: Ember.computed.reads('clip.numBeats'),
  bpm: Ember.computed.reads('metronome.bpm'),
  isPlaying: false,
  isFinished: false,
  tick: 0,

  // optional params
  repeatInterval: null,

  // current seekBeat from this event's frame of reference
  // different from _seekBeat because this factors in delay, and clamps to clip min and max
  seekBeat: function() {
    var seekBeat = this.get('_seekBeat');
    var delayBeats = this.get('_delayBeats');
    var numBeats = this.get('numBeats');

    // factor in delay
    seekBeat += delayBeats;

    return clamp(0, seekBeat, numBeats);
  }.property('_seekBeat', 'numBeats', '_delayBeats'),

  // returns current beat from this event's frame of reference
  getCurrentBeat() {
    let currentBeat = this.get('metronome').getCurrentBeat() - this.get('startBeat');
    return clamp(0, currentBeat, this.get('numBeats'));
  },

  // internal params
  _delayTime: 0,
  _delayBeats: function() {
    return timeToBeat(this.get('_delayTime'), this.get('bpm'));
  }.property('_delayTime', 'bpm'),

  _startEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeStart.bind(this),
      clock: this.get('clock'),
    });
  }),

  _tickEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeTick.bind(this),
      clock: this.get('clock'),
    });
  }),

  _endEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeEnd.bind(this),
      clock: this.get('clock'),
    });
  }),

  // current metronome seekBeat from clipEvent's frame of reference
  _seekBeat: function() {
    var metronomeSeekBeat = this.get('metronome.seekBeat');
    var startBeat = this.get('startBeat');

    return metronomeSeekBeat - startBeat;
  }.property('metronome.seekBeat', 'startBeat'),

  _schedulingDidChange: function() {
    Ember.run.once(this, '_updateEventTimes');
  }.observes('metronome.isPlaying', 'metronome.absSeekTime', 'startBeat', 'bpm', 'endBeat', 'numBeats').on('init'),

  _updateEventTimes: function() {
    let metronome = this.get('metronome');
    let seekTime = beatToTime(this.get('_seekBeat'), this.get('bpm'));
    let lengthTime = beatToTime(this.get('numBeats'), this.get('bpm'));
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
    let tickEvent = this.get('_tickEvent');
    let endEvent = this.get('_endEvent');
    let absStartTime = metronome.getCurrentAbsTime() - seekTime;
    let absEndTime = absStartTime + lengthTime;

    startEvent.setProperties({
      deadline: absStartTime,
      isScheduled: !isFinished && metronomeIsPlaying,
    });

    tickEvent.setProperties({
      deadline: absStartTime,
      isScheduled: !isFinished && metronomeIsPlaying,
    });

    endEvent.setProperties({
      deadline: absEndTime,
      isScheduled: metronomeIsPlaying
    });
  },

  _executeStart(delay) {
    // console.log("_executeStart", this.get('clip.model.title'), delay);
    // TODO(PERFORMANCE): will this miss a few ticks when run loop is behind?
    this.get('_tickEvent').set('repeatInterval', this.get('repeatInterval'));

    this.setProperties({
      _delayTime: delay,
      isPlaying: true,
      isFinished: false,
    });
  },

  _executeTick(delay) {
    // console.log("_executeTick", this.get('clip.model.title'));
    this.incrementProperty('tick');
  },

  _executeEnd(delay) {
    // console.log("_executeEnd", this.get('clip.model.title'), delay);
    this.get('_tickEvent').cancelRepeat();

    this.setProperties({
      isPlaying: false,
      isFinished: true,
    });
  },

  destroy() {
    this.get('_startEvent').destroy();
    this.get('_tickEvent').destroy();
    this.get('_endEvent').destroy();
    this._super.apply(this, arguments);
  }
});
