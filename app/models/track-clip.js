import Ember from 'ember';
import DS from 'ember-data';
import AudioClip from './audio-clip';

export default AudioClip.extend({
  type: Ember.computed(() => { return 'track-clip'; }),

  startBeat: Ember.computed.alias('mixItem.trackStartBeat'),
  numBeats: Ember.computed.alias('mixItem.numTrackBeats'),

  track: Ember.computed.alias('mixItem.track'),
});
