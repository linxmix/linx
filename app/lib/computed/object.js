import Ember from 'ember';

export default function computedObject(constructor, attributes) {
  let keys = Object.keys(attributes);
  let args = keys.map((key) => { return attributes[key]; });

  args.push({
    get(key) {
      let attrs = keysToAttrs(this, keys, attributes);
      attrs.parentPropertyPath = key;
      return constructor.create(attrs);
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
