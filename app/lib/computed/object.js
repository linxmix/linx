import Ember from 'ember';

export default function computedObject(constructor, attributes) {
  let keys = Object.keys(attributes);
  let args = keys.map((key) => { return attributes[key]; });

  args.push({
    get(key) {
      let attributes = keysToAttrs(this, keys, attributes);
      attributes.parentPropertyPath = key;
      return Constructor.create(attributes);
    },
  });

  return Ember.computed(...args).readOnly();
}

function keysToAttrs(context, keys, attributes) {
  return keys.reduce((attrs, key) => {
    attrs[key] = context.get(attributes[key]);
    return attrs;
  }, {});
}
