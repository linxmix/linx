import Ember from 'ember';
import Metronome from 'linx/lib/metronome';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

// sequences arrangementClips as events against metronome
// wraps imperative behaviour to avoid overhead of realtime computed properties
// exposes metronome, isPlaying, isReady and playback actions
export default Ember.Mixin.create(
  RequireAttributes('arrangement', 'clock'), {

  actions: {
    playpause: function() {
      this.get('metronome').playpause();
    },

    skipBack: function() {
      console.log("skip back unimplemented");
    },

    skipForth: function() {
      console.log("skip forth unimplemented");
    },

    seekToTime: function(time) {
      this.get('metronome').seekToTime(time);
    }
  },

  // exposed params
  isPlaying: Ember.computed.alias('metronome.isPlaying'),
  metronome: Ember.computed(function() {
    return Metronome.create({ clock: this.get('clock') });
  }),
  notReady: Ember.computed.not('isReady'),
  isReady: function() {
    if (!this.get('_arrangementClips.length')) { return false; }

    return this.get('_arrangementClips.length') === this.get('_clipEvents.length');
  }.property('_arrangementClips.length', '_clipEvents.length'),

  // internal params
  _arrangementClips: Ember.computed.oneWay('arrangement.clips'),
  _clipEvents: function() {
    var notReadyClips = this.get('_arrangementClips').filterBy('isReady', false);
    if (notReadyClips.get('length') > 0) { return []; }

    return this.get('_arrangementClips').map((clip) => {
      return ClipEvent.create({
        arrangementClip: clip,
        player: this,
      });
    });
  }.property('_arrangementClips.@each.isReady')
});

// binds an arrangementClip to the metronome as a ClipEvent
var ClipEvent = Ember.Object.extend(
  RequireAttributes('arrangementClip', 'player'), {

  // params
  metronome: Ember.computed.alias('player.metronome'),
  startBeat: Ember.computed.alias('arrangementClip.startBeat'),

  // internal params
  _event: null,

  schedulingDidChange: function() {
    Ember.run.once(this, 'updateEvent');
  }.observes('metronome.isPlaying', 'metronome.startTime', 'startBeat', 'arrangementClip'),

  updateEvent: function() {
    this.unschedule();
    if (this.get('metronome.isPlaying')) {
      this.schedule();
    } else {
      this.get('arrangementClip').pause();
    }
  },

  schedule: function() {
    var arrangementClip = this.get('arrangementClip');
    var startBeat = this.get('startBeat');
    var metronome = this.get('metronome');
    var event = metronome.scheduleAtBeat(arrangementClip.play.bind(arrangementClip), startBeat);

    if (event) {
      event.onexpired = function(event) {
        console.log('EVENT EXPIRED!', event, arrangementClip);
      }
      this.set('_event', event);
    }
  },

  unschedule: function() {
    var event = this.get('_event');
    if (event) {
      event.clear();
      this.set('_event', null);
    }
  }
});
