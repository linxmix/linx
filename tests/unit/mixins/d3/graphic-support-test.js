/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import Ember from 'ember';
import D3GraphicSupportMixin from 'linx/mixins/d3/graphic-support';

describe('D3GraphicSupportMixin', function() {
  // Replace this with your real tests.
  it('works', function() {
    var D3GraphicSupportObject = Ember.Object.extend(D3GraphicSupportMixin);
    var subject = D3GraphicSupportObject.create();
    expect(subject).to.be.ok;
  });
});
