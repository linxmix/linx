import Ember from 'ember';

// Aliases given properties from given objectPath
export default function(objectPath, properties) {
  Ember.assert('Need objectPath for AliasObjectPropertiesMixin', !!objectPath);
  Ember.assert('Need properties for AliasObjectPropertiesMixin', properties && Ember.isArray(properties));

  return Ember.Mixin.create(properties.reduce((mixinParams, propertyName) => {
    let objectPropertyPath = `${objectPath}.${propertyName}`

    mixinParams[propertyName] = Ember.computed(objectPropertyPath, function() {
      return this.get(objectPropertyPath);
    });

    return mixinParams;
  }, {}));
}
