import Ember from 'ember';
import Metronome from 'linx/lib/metronome';
import RequireAttributes from 'linx/lib/require-attributes';

// sequences arrangementClips as events against metronome
// wraps imperative behaviour to avoid overhead of realtime computed properties
// exposes metronome and playback actions
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

  // internal params
  _arrangementClips: Ember.computed.oneWay('arrangement.clips'),
  _clipEvents: function() {
    console.log("arrangement-player events", this.get('_arrangementClips'));

    return this.get('_arrangementClips').map((clip) => {
      return ClipEvent.create({
        arrangementClip: clip,
        player: this,
      });
    });
  }.property('_arrangementClips.@each')
});

// binds an arrangementClip to the metronome as a ClipEvent
var ClipEvent = Ember.Object.extend(
  RequireAttributes('arrangementClip', 'player'), {

  // params
  metronome: Ember.computed.alias('player.metronome'),
  clip: Ember.computed.alias('arrangementClip.clip.content'), // TODO: not content...
  startBeat: Ember.computed.alias('arrangementClip.startBeat'),

  // internal params
  _event: null,

  update: function() {
    this.unschedule();
    var clip = this.get('clip');
    if (!clip) {
      return;
    } else if (this.get('metronome.isPlaying')) {
      this.schedule();
    } else {
      clip.pause();
    }
  }.observes('metronome.isPlaying', 'metronome.startTime', 'startBeat', 'clip'),

  // schedule this clip to play at start of clip
  schedule: function() {
    var clip = this.get('clip');
    var startBeat = this.get('startBeat');
    var event = this.get('metronome').scheduleAtBeat(clip, startBeat);

    if (event) {
      event.onexpired = function(event) {
        console.log('EVENT EXPIRED!', event, clip);
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
