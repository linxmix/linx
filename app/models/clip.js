import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';

// Base clip model.
// Provides helpful properties which may be overridden
export default DS.Model.extend(
  OrderedHasManyItemMixin('arrangement'), {
  // TODO(REQUIREPROPERTIES)
  // RequireAttributes('startBeat', 'numBeats', 'isReady', 'isValid', 'type'), {

  row: DS.attr('number'), // for complex display
  startBeat: DS.attr('number', { defaultValue: 0 }), // starting beat in arrangement
  arrangement: DS.belongsTo('arrangement', { async: true }),

  endBeat: add('startBeat', 'numBeats'),
  numBeats: subtract('endBeat', 'startBeat'),

  prevClip: Ember.computed.reads('prevItem'),
  nextClip: Ember.computed.reads('nextItem'),

  isValidNumBeats: Ember.computed.gt('numBeats', 0),
  isValid: Ember.computed.reads('isValidNumBeats'),
  isReady: false,


  save() {
    console.log('save clip', this.id);
    let promise = this._super.apply(this, arguments);
    return promise;
  },

  destroyRecord() {
    console.log('destroy clip');
    return this._super.apply(this, arguments);
  }
});
