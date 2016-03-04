import Ember from 'ember';
import DS from 'ember-data';

import AutomationClip from '../../arrangement/automation-clip';

export default AutomationClip.extend({
  transition: DS.belongsTo('mix/transition'),
  targetClip: DS.belongsTo('mix/track-clip'),

  arrangement: Ember.computed.reads('transition'),
});
