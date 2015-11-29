import FactoryGuy from 'ember-data-factory-guy';
import Faker from 'npm:faker';

FactoryGuy.define('arrangement/track-clip', {
  default: {
    startBeat(model) { return Faker.random.number({ min: 0, max: 10 }); },
    audioStartBeat(model) { return Faker.random.number({ min: 0, max: 10 }); },
    audioEndBeat(model) { return Faker.random.number({ min: 10, max: 20 }); },
    track: {},
  },
});
