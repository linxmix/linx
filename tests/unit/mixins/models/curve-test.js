/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import Ember from 'ember';
import ModelsCurveMixin from 'linx/mixins/models/curve';

describe('ModelsCurveMixin', function() {
  // Replace this with your real tests.
  it('works', function() {
    var ModelsCurveObject = Ember.Object.extend(ModelsCurveMixin);
    var subject = ModelsCurveObject.create();
    expect(subject).to.be.ok;
  });
});
