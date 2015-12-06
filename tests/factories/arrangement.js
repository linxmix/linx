import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('arrangement', {
  default: {
    trackClips: FactoryGuy.hasMany('arrangement/track-clip', 0),
    automationClips: FactoryGuy.hasMany('arrangement/automation-clip', 0),
  },
});
