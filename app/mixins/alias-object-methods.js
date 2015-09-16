import Ember from 'ember';

// Aliases given methods from given objectPath
export default function(objectPath, methods) {
  Ember.assert('Need objectPath for AliasObjectMethodsMixin', !!objectPath);
  Ember.assert('Need methods for AliasObjectMethodsMixin', methods && Ember.isArray(methods));

  return Ember.Mixin.create(methods.reduce((mixinParams, methodName) => {
    mixinParams[methodName] = function(...args) {
      let object = this.get(objectPath);
      let method = object[methodName];

      return method.apply(object, args);
    };

    return mixinParams;
  }, {}));
}
