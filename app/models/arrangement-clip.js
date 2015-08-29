import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

export default Clip.extend({
  type: 'arrangement-clip',

  arrangement: DS.belongsTo('arrangement', { async: true }),
  numBeats: Ember.computed.reads('arrangement.numBeats'),
  isReady: Ember.computed.reads('arrangement.isReady'),
});
