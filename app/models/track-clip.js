import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

export default Clip.extend({
  type: Ember.computed(() => { return 'track-clip' }),
});
