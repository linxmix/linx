/* jshint newcap: false */
import Ember from 'ember';
import {
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import RequireAttributes from 'linx/lib/require-attributes';

function DescribeRequiredAttributesBehaviours(BaseConstructor) {
  describe(BaseConstructor.toString(), function() {
    let Constructor;

    it('fails if missing required attributes', function() {
      Constructor = BaseConstructor.extend(
        RequireAttributes('a', 'b'));

      expect(() => { Constructor.create(); }).to.throw();
    });

    it('fails if missing a required attribute', function() {
      Constructor = BaseConstructor.extend(
        RequireAttributes('a', 'b'));

      expect(() => { Constructor.create({ a: true }); }).to.throw();
    });

    it('is ok for falsy but defined attributes', function() {
      Constructor = BaseConstructor.extend(
        RequireAttributes('a', 'b', 'c', 'd', 'e'));

      expect(() => { Constructor.create({ a: '', b: false, c: [], d: {}, e: 0 }); }).not.to.throw();
    });

    it('proceeds if not missing required attributes', function() {
      Constructor = BaseConstructor.extend(
        RequireAttributes('a', 'b'));

      expect(() => { Constructor.create({ a: true, b: true }); }).not.to.throw();
    });

    it('inherits parent requirements', function() {
      let ParentConstructor = BaseConstructor.extend(
        RequireAttributes('a', 'b'));

      Constructor = ParentConstructor.extend(
        RequireAttributes('c'));

      expect(() => { Constructor.create({ a: true }); }).to.throw();
      expect(() => { Constructor.create({ c: true }); }).to.throw();
      expect(() => { Constructor.create({ a: true, b: true, c: true }); }).not.to.throw();
    });

  });
}

describe('RequireAttributes', function() {
  DescribeRequiredAttributesBehaviours(Ember.Component);
  DescribeRequiredAttributesBehaviours(Ember.Controller);
  DescribeRequiredAttributesBehaviours(Ember.Object);
});
