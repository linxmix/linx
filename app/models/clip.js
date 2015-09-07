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

  endBeat: add('startBeat', 'numBeats'),
  numBeats: subtract('endBeat', 'startBeat'),

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

  isClipReady: Ember.computed.and('isValidStartBeat', 'isValidEndBeat', 'isValidNumBeats'),

  save() {
    console.log('save clip', this.id);
    let promise = this._super.apply(this, arguments);
    return promise;
  },

  destroyRecord() {
    console.log('destroy clip');
    return this._super.apply(this, arguments);
  },

  modelName: Ember.computed.reads('constructor.modelName'),
});
