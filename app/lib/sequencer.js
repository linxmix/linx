import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import Metronome from 'linx/lib/metronome';

// sequences arrangementItems as events against metronome
// sequencer wraps imperative behaviour to avoid overhead of realtime computed properties
export default Ember.Object.extend(
  RequireAttributes('player'), {

  playpause: function() {
    this.get('metronome').toggleProperty('isPlaying');
  },

  // params
  arrangement: Ember.computed.oneWay('player.arrangement'),
  items: Ember.computed.oneWay('arrangement.items'),
  metronome: Ember.computed(function() {
    return Metronome.create({ clock: this.get('player.clock') });
  }),
  isPlaying: Ember.computed.alias('metronome.isPlaying'),
  events: function() {
    console.log("sequencer events", this.get('items'));

    return this.get('items').map((item) => {
      return ClipEvent.create({
        arrangementItem: item,
        sequencer: this,
      });
    });
  }.property('items.@each'),
});

// binds an arrangementClip to the metronome as a ClipEvent
var ClipEvent = Ember.Object.extend(
  RequireAttributes('arrangementItem', 'sequencer'), {

  // params
  clip: Ember.computed.alias('arrangementItem.clip'),
  metronome: Ember.computed.alias('sequencer.metronome'),
  isPlaying: Ember.computed.alias('sequencer.isPlaying'),
  startEvent: null,
  endEvent: null,

  sequencerStartTime: Ember.computed.alias('sequencer.startTime'),
  clipStartTime: function() {

  }.property('arrangementItem.startBeat'),

  // setupHandlers: function() {
  //   this.get('clockEvent').onexpired = function(clockEvent) { console.log('oooh :(!') }
  // }.on('init'),

  updateEvent: function() {
    if (this.get('isPlaying')) {
      this.schedule(this.get('startTime'));
    } else {
      this.unschedule();
    }
  }.observes('isPlaying', 'time'),

  // schedule this item to play at start of item
  // schedule this item to pause at end of item
  schedule: function() {
    // TODO
    // schedule content at startTime + start
    // then schedule end at time + start + length
    var clock = this.get('clock');
    var clip = this.get('clip');
    // var _events = clock.scheduleClip()

    // start clip, and provide a method of getting clipTime
    var startEvent = clock.callbackAtTime(() => {
      clip.start(this.getClipTime.bind(this));
    });

  },

  // currentTime from the clip's reference
  getClipTime: function() {
    return this.get('sequencer').getCurrentTime() - this.get('clipStartTime');
  },

  unschedule: function() {
    var startEvent = this.get('startEvent');
    var endEvent 
    this.get('events').forEach(function(event) { event.clear(); });
    this.set('events', null);
  }
});
