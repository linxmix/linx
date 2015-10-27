import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import multiply from 'linx/lib/computed/multiply';

const MODELS = {
  honda: 'accord',
  toyota: 'prius',
  ford: 'mustang'
};

let Statistic = Ember.Object.extend({
  probabilityA: 3,
  probabilityB: 2,
  probabilityProduct: multiply('probabilityA', 'probabilityB', 0.5),
});

describe('MultiplyComputedProperty', function() {
  let statistic;

  beforeEach(function() {
    statistic = Statistic.create();
  });

  it('has the correct initial value', function() {
    expect(statistic.get('probabilityProduct')).to.equal(3 * 2 * 0.5);
  });

  it('updates properly after modifying a dependent key', function() {
    Ember.run(() => {
      statistic.set('probabilityA', 4);
    });

    expect(statistic.get('probabilityProduct')).to.equal(4 * 2 * 0.5);
  });

  // it('blows up when a depdendent key is not a number', function() {
  //   Ember.run(() => {
  //     statistic.set('probabilityA', null);
  //   });

  //   expect(() => { return statistic.get('probabilityProduct'); }).to.throw();
  // });
});
