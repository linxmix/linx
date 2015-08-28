import Ember from 'ember';
import DS from 'ember-data';
import MixItem from './mix-item';
import { isNumber } from 'linx/lib/utils';

// Mix item which contains a track
export default MixItem.extend({
  type: Ember.computed(() => { return 'track-mix-item'; }),

  model: DS.belongsTo('track', { async: true }),
  track: Ember.computed.alias('model'),

  tracks: function() {
    return [this.get('track.content')];
  }.property('track.content'),

  clipStartBeatWithoutTransition: Ember.computed.reads('track.audioMeta.firstBeat'),
  clipStartBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),

  clipEndBeatWithoutTransition: Ember.computed.reads('track.audioMeta.lastBeat'),
  clipEndBeatWithTransition: Ember.computed.reads('transition.fromTrackEndBeat'),

  _clip: DS.belongsTo('track-clip', { async: true }),
  clip: withDefaultModel('_clip', function() {
    return this.get('store').createRecord('track-clip');
  }),

  _transitionClip: DS.belongsTo('transition-clip', { async: true }),
  transitionClip: withDefaultModel('_transitionClip', function() {
    return this.get('store').createRecord('transition-clip');
  }),

  addToArrangement(arrangement) {
    var numTrackBeats = item.get('numTrackBeats');
    var trackClip = store.createRecord('track-clip', {
      mixItem: item
    });
    var trackArrangementItem = arrangement.appendItem({
      clip: trackClip,
      startBeat: currBeat,
    });
    currBeat += numTrackBeats;
  },


});
