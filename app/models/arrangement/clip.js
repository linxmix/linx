import Ember from 'ember';
import DS from 'ember-data';

import PlayableClipMixin from 'linx/mixins/playable-arrangement/clip';

// Base clip model.
export default DS.Model.extend(
  PlayableClipMixin, {

  row: DS.attr('number'), // for complex display
  startBeat: DS.attr('number', { defaultValue: 0 }), // starting beat in arrangement
  arrangement: DS.belongsTo('arrangement', { async: true }),
  timeSignature: Ember.computed.reads('arrangement.timeSignature'),
});
