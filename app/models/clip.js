import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';
import ReadinessMixin from 'linx/mixins/readiness';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';
import { isNumber } from 'linx/lib/utils';

// Base clip model.
// Provides helpful properties which may be overridden
export default DS.Model.extend(
  ReadinessMixin('isClipReady'),
  OrderedHasManyItemMixin('arrangement'), {
  // TODO(REQUIREPROPERTIES)
  // RequireAttributes('startBeat', 'numBeats', 'isReady', 'isValid', 'type'), {

  row: DS.attr('number'), // for complex display
  startBeat: DS.attr('number', { defaultValue: 0 }), // starting beat in arrangement
  arrangement: DS.belongsTo('arrangement', { async: true }),
  timeSignature: Ember.computed.reads('arrangement.timeSignature'),

  endBeat: add('startBeat', 'numBeats'),
  numBeats: subtract('endBeat', 'startBeat'),
  halfNumBeats: Ember.computed('numBeats', function() {
    return this.get('numBeats') / 2.0;
  }),
  centerBeat: add('startBeat', 'halfNumBeats'),

  numBars: Ember.computed('numBeats', 'timeSignature', function() {
    return this.get('numBeats') / this.get('timeSignature');
  }),

  isValidStartBeat: function() {
    let startBeat = this.get('startBeat');
    return isNumber(startBeat);
  }.property('startBeat'),

  isValidEndBeat: function() {
    let endBeat = this.get('endBeat');
    return isNumber(endBeat);
  }.property('endBeat'),

  isValidNumBeats: function() {
    let numBeats = this.get('numBeats');
    return isNumber(numBeats) && numBeats > 0;
  }.property('numBeats'),

  isValid: Ember.computed.and('isValidStartBeat', 'isValidEndBeat', 'isValidNumBeats'),
  isClipReady: true,

  modelName: function() {
    return this.constructor.modelName;
  }.property()
});
