import Ember from 'ember';

import { isString } from 'linx/lib/utils';

export default function computedObject(constructor, attributes) {
  let keys = Object.keys(attributes);
  let args = keys.map((key) => { return attributes[key]; }).filter(isString).without('this');

  args.push({
    get(key) {
      let attrs = keysToAttrs(this, keys, attributes);
      attrs.parentPropertyPath = key;
      let object = constructor.create(attrs);

      // cleanup prevObject
      // TODO(CLEANUP): why does it not work to scope args here?
      let prevObject = this.get(`_____${key}`);
      prevObject && Ember.run(prevObject, 'destroy');
      this.set(`_____${key}`, object);

      return object;
    },
  });

  return Ember.computed(...args);
}

// TODO(CLEANUP): de-dupe with cssStyle functions
function keysToAttrs(context, keys, attributes) {
  return keys.reduce((attrs, key) => {
    let pathOrValue = attributes[key];
    let value = pathOrValue;

    // allow for non-string values, as well as 'this'
    if (isString(pathOrValue)) {
      let path = pathOrValue;
      if (path === 'this') {
        value = context;
      } else {
        value = context.get(path);
      }
    }

    attrs[key] = value;
    return attrs;
  }, {});
}
