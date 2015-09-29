import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import lookup from 'linx/lib/computed/lookup';

const MODELS = {
  honda: 'accord',
  toyota: 'prius',
  ford: 'mustang'
};

let Car = Ember.Object.extend({
  make: null,
  model: lookup('make', MODELS)
});

describe('lookup macro', function() {
  let car;

  beforeEach(function() {
    car = Car.create({ make: 'honda' });
  });

  it('has the correct initial value', function() {
    expect(car.get('model')).to.equal('accord');
  });

  it('updates properly after modifying the dependent key', function() {
    car.set('make', 'ford');
    expect(car.get('model')).to.equal('mustang');
  });
});
