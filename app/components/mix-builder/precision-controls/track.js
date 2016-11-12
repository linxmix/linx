import Ember from 'ember';

import { EKMixin, EKOnInsertMixin, keyDown } from 'ember-keyboard';

import { makeKeybinding } from 'linx/lib/utils';

const NUDGE_VALUE = 0.005;

const BEAT_JUMP_KEYBINDINGS = [
  // from track backward
  {
    key: 'alt+KeyE',
    beats: NUDGE_VALUE,
    direction: -1,
    isFromTrackClip: true,
    isNudge: true,
  },
  {
    key: 'KeyE',
    beats: 4,
    direction: -1,
    isFromTrackClip: true,
  },
  {
    key: 'shift+KeyE',
    beats: 16,
    direction: -1,
    isFromTrackClip: true,
  },

  // from track forward
  {
    key: 'alt+KeyR',
    beats: NUDGE_VALUE,
    direction: 1,
    isFromTrackClip: true,
    isNudge: true,
  },
  {
    key: 'KeyR',
    beats: 4,
    direction: 1,
    isFromTrackClip: true,
  },
  {
    key: 'shift+KeyR',
    beats: 16,
    direction: 1,
    isFromTrackClip: true,
  },

  // to track backward
  {
    key: 'alt+KeyD',
    beats: NUDGE_VALUE,
    direction: -1,
    isNudge: true,
  },
  {
    key: 'KeyD',
    beats: 4,
    direction: -1,
  },
  {
    key: 'shift+KeyD',
    beats: 16,
    direction: -1,
  },

  // to track forward
  {
    key: 'alt+KeyF',
    beats: NUDGE_VALUE,
    direction: 1,
    isNudge: true,
  },
  {
    key: 'KeyF',
    beats: 4,
    direction: 1,
  },
  {
    key: 'shift+KeyF',
    beats: 16,
    direction: 1,
  },
];

const KeyboardBeatJumpMixin = Ember.Mixin.create(BEAT_JUMP_KEYBINDINGS.reduce(
  (props, { key, beats, direction, isFromTrackClip, isNudge }) => {
    const propertyName = `____${key}-${beats}-${direction}`;

    props[propertyName] = Ember.on(keyDown(key), makeKeybinding(function(e) {
      if (!this.get('clip')) { return; }

      if (isFromTrackClip) {
        if (this.get('isFromTrackClip')) {
          this.beatJump(beats, direction, isNudge);
        }
      } else {
        if (!this.get('isFromTrackClip')) {
          this.beatJump(beats, direction, isNudge);
        }
      }
    }));

    return props;
  },
  {}
));

const SECONDS_TO_ANALYZE = 20;

export default Ember.Component.extend(
  KeyboardBeatJumpMixin,
  EKMixin,
  EKOnInsertMixin, {

  classNames: ['MixBuilderPrecisionControlsTrack'],

  // required params
  clip: null,
  isFromTrackClip: false,
  isToTrackClip: false,

  // optional params
  jumpTrackTask: null,
  jumpTrack: Ember.K,
  quantizeBeat: Ember.K,

  track: Ember.computed.reads('clip.track'),
  beatDetection: Ember.inject.service(),

  // used by KeyboardBeatJumpMixin
  beatJump(beats, direction, isNudge) {
    const clip = this.get('clip');
    const beatGrid = clip.get('audioMeta.beatGrid');

    if (isNudge || this.get('isToTrackClip')) {
      const audioStartBeat = clip.get('audioStartBeat');
      const newAudioStartBeat = audioStartBeat - (beats * direction);
      const newAudioStartTime = beatGrid.beatToTime(newAudioStartBeat);

      clip.set('audioStartTime', newAudioStartTime);
    } else if (this.get('isFromTrackClip')) {
      const audioEndBeat = clip.get('audioEndBeat');
      const newAudioEndBeat = audioEndBeat + (beats * direction);
      const newAudioEndTime = beatGrid.beatToTime(newAudioEndBeat);

      clip.set('audioEndTime', newAudioEndTime);
    }
  },

  _moveFromTrack: Ember.on(keyDown('KeyW'), makeKeybinding(function(e) {
    if (this.get('isFromTrackClip')) {
      this.send('moveTransition');
    }
  })),

  _moveToTrack: Ember.on(keyDown('KeyS'), makeKeybinding(function(e) {
    if (this.get('isToTrackClip')) {
      this.send('moveTransition');
    }
  })),

  actions: {
    analyzeTrack() {
      const task = this.get('beatDetection.analyzeTrackTask');
      const track = this.get('track');
      const trackClip = this.get('clip.content');
      const currentAudioTime = trackClip.getCurrentAudioTime();
      console.log({ currentAudioTime})

      task.perform(track, {
        startTime: currentAudioTime - SECONDS_TO_ANALYZE / 2,
        endTime: currentAudioTime + SECONDS_TO_ANALYZE / 2,
      }).then(({ peaks, intervals }) => {

        console.log('analyze track markers', peaks, intervals);
        trackClip.setProperties({
          markers: peaks,
        });
      });
    },

    moveTransition() {
      Ember.RSVP.resolve(this.get('clip')).then((clip) => {
        if (!clip) { return; }

        const beat = this.get('clip.arrangement.metronome.seekBeat');

        if (this.get('isFromTrackClip')) {
          clip.set('audioEndTime', clip.getAudioTimeFromArrangementBeat(beat));
        } else if (this.get('isToTrackClip')) {
          // this code was to allow moving transition to end beat
          // const transitionBeatCount = this.get('clip.mixItem.transition.beatCount');
          // const time = clip.getAudioTimeFromArrangementBeat(beat - transitionBeatCount);
          clip.set('audioStartTime', clip.getAudioTimeFromArrangementBeat(beat));
        }
      });
    }
  }
});
