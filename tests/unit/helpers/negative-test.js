/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import {
  negative
} from 'linx/helpers/negative-number';

describe('NegativeNumberHelper', function() {
  it('works', function() {
    var result = negative([42]);
    expect(result).to.be.ok;
    expect(result).to.equal(-42);
  });
});
