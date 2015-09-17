import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

// Clip that controls an automatable of another clip
export default Clip.extend({
  numBeats: DS.attr('number', { defaultValue: 0 }), // starting beat in arrangement
});
