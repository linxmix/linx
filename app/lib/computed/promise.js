import Ember from 'ember';

// TODO: test/use this.
// adds propertyNamePromise
// propertyName is populated when the promise fulfills
export default function(defaultValue, fn, ...props) {
  props.push({
    get(key) {
      let promiseKey = `${key}Promise`;

      // on get, execute fn
      this.set(promiseKey, new Ember.RSVP.Promise((resolve, reject) => {
        resolve(fn.call(this)).then((content) => {

          // on fn completion, update property with content
          if (this.get(key) !== content) {
            this.set(key, content);
          }

          return content;
        });
      }));

      return defaultValue;
    },

    set(key, value) {
      return value;
    }
  });

  return Ember.computed.apply(Ember, props);
}
