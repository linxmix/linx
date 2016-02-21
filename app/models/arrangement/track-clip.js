import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';
import TrackClipMixin from 'linx/mixins/playable-arrangement/track-clip';
import { withDefaultProperty } from 'linx/lib/computed/with-default';

export default Clip.extend(
  TrackClipMixin, {

  // implement clip
  startBeat: DS.attr('number', { defaultValue: 0 }),

  // implement track-clip
  audioStartBeat: withDefaultProperty('_audioStartBeat', '_defaultAudioStartBeat'),
  audioEndBeat: withDefaultProperty('_audioEndBeat', '_defaultAudioEndBeat'),

  _audioStartBeat: DS.attr('number'),
  _audioEndBeat: DS.attr('number'),
  _defaultAudioStartBeat: Ember.computed.reads('audioMeta.firstWholeBeat'),
  _defaultAudioEndBeat: Ember.computed.reads('audioMeta.endBeat'),

  track: DS.belongsTo('track', { async: true }),
  audioMeta: Ember.computed.reads('track.audioMeta'),
});
