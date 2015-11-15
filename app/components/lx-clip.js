import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  RequireAttributes('clip', 'metronome', 'pxPerBeat'), {

  classNames: ['LxClip'],
  attributeBindings: ['componentStyle:style', 'draggable'],
  classNameBindings: ['isDraggable'],

  componentStyle: cssStyle({
    'left': 'startPx',
    'width': 'widthPx',
  }),

  // params
  clipEvent: null,

  // TODO: refactor into mixin?
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
    let { x, y } = originalEvent

    // ignore final drag event
    // TODO: why does is event at 0,0?
    if (!(x === 0 && y === 0)) {
     this.sendAction('onDrag', this.getHoverBeat(e));
    }
  },

  updateClipEvent: function() {
    Ember.run.once(this, '_updateClipEvent');
  }.observes('metronome', 'clip').on('init'),

  _updateClipEvent: function() {
    let clip = this.get('clip');
    let metronome = this.get('metronome');

    // re-sync clip and metronome
    if (!(metronome && clip)) {
      this.destroyClipEvent();
    } else {
      let { clipEvent, clipRepeatInterval } = this.getProperties('clipEvent', 'clipRepeatInterval');

      if (!clipEvent) {
        clipEvent = metronome.createClipEvent(clip);
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
