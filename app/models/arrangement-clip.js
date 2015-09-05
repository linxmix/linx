import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

export default Clip.extend({
  type: 'arrangement-clip',

  // implementing Clip
  isValid: Ember.computed.and('nestedArrangement.content', 'isValidNumBeats'),
  numBeats: Ember.computed.reads('nestedArrangement.numBeats'),
  isReady: Ember.computed.reads('nestedArrangement.isReady'),

  // arrangement-clip specific
  nestedArrangement: DS.belongsTo('arrangement', { async: true, inverse: null }),
});
