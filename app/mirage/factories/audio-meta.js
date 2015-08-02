import Mirage, {faker} from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  duration: faker.random.number({
    min: 50,
    max: 200,
    precision: 0.001
  }),

  bpm: faker.random.number({
    min: 50,
    max: 200,
    precision: 0.001
  }),

  timeSignature: faker.list.random(3, 4),

  // TODO: key, mode, loudness
});
