import FactoryGuy from 'ember-data-factory-guy';
import Faker from 'npm:faker';

// TODO(CLEANUP): make this extend from arrangement/clip
FactoryGuy.define('arrangement/automation-clip', {
  default: {
    startBeat(model) { return Faker.random.number({ min: 0, max: 10 }); },
  },
});
