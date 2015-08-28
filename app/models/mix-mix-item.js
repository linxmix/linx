import MixItem from './mix-item';
import Ember from 'ember';
import DS from 'ember-data';
import equalProps from 'linx/lib/computed/equal-props';
import { isNumber } from 'linx/lib/utils';

// Mix item which contains a mix
export default MixItem.extend({
  type: Ember.computed(() => { return 'mix-mix-item'; }),

  model: DS.belongsTo('mix', { async: true }),
  mix: Ember.computed.alias('model'),
  tracks: Ember.computed.mapBy('mix.tracks', 'content'),

  clipStartBeatWithoutTransition: Ember.computed.alias('mix.items.firstObject.clipStartBeat'),
  clipStartBeatWithTransition: Ember.computed.alias('prevTransition.toTrackStartBeat'),

  clipEndBeatWithoutTransition: Ember.computed.alias('mix.numBeats'),
  clipEndBeatWithTransition: function() {
    let numBeats = this.get('mix.numBeats');
    let delta = this.get('mix.items.lastObject.clipEndBeat') - this.get('transition.fromTrackEndBeat');
    return numBeats - delta;
  }.property('mix.numBeats', 'mix.items.lastObject.clipEndBeat', 'transition.fromTrackEndBeat'),
});
