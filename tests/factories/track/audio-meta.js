import FactoryGuy from 'ember-data-factory-guy';
import Faker from 'npm:faker';

FactoryGuy.define('track/audio-meta', {
  default: {
    duration(model) { return Faker.random.number({ min: 300, max: 400 }); },
    bpm(model) { return Faker.random.number({ min: 60, max: 200 }); },
    timeSignature: 4,
    key(model) { return Faker.random.number({ min: 0, max: 11, precision: 1 }); },
    mode: 0,
    loudness(model) { return Faker.random.number({ min: -10, max: 0 }); },
    markers: FactoryGuy.hasMany('track/audio-meta/grid-marker', 1),
  },
});
