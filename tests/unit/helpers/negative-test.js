/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import {
  negativeNumber
} from 'linx/helpers/negative-number';

describe('NegativeNumberHelper', function() {
  it('works', function() {
    var result = negativeNumber(42);
    expect(result).to.be.ok;
    expect(result).to.equal(-42);
  });
});
