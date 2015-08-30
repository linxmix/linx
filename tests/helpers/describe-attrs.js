import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import _ from 'npm:underscore';

// accepted margin of error for numbers
const EPSILON = 0.0005;

export default function(name, options) {
  let subject;

  beforeEach(function() {
    subject = options.subject.call(this);
  });

  describe(`${name} attributes`, function() {
    Object.keys(options).without('subject').map(function(key) {
      let val = options[key];

      it(`${key} is correct`, function() {
        Ember.run(function() {
          let expectedVal = _.isFunction(val) ? val() : val;
          let actualVal = subject.get(key);

          if (_.isNumber(expectedVal)) {
            expect(actualVal).to.be.closeTo(expectedVal, EPSILON);
          } else {
            expect(actualVal).to.equal(expectedVal);
          }
        });
      });
    });
  });
}
