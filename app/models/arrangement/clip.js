import Ember from 'ember';
import DS from 'ember-data';

import PlayableClipMixin from 'linx/mixins/playable-arrangement/clip';

// Base clip model.
export default DS.Model.extend(
  PlayableClipMixin, {

  row: DS.attr('number'), // for complex display
  startBeat: DS.attr('number', { defaultValue: 0 }), // starting beat in arrangement
  beatCount: DS.attr('number', { defaultValue: 16 }), // number of beats in arrangement

  arrangement: DS.belongsTo('arrangement', { async: true }),

  // TODO(REFACTOR): does this make sense?
  timeSignature: Ember.computed.reads('arrangement.timeSignature'),
});
