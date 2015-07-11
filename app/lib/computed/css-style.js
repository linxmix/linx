import Ember from 'ember';


/**
  Creates a CSS string based on the provided map of css properties to object
  keys.

  ```javascript
  var obj = Ember.Object.extend({
    size: '100px',
    color: 'red',
    style: cssStyle({
      'width':            'size',
      'background-color': 'color'
  });

  obj.get('style') // => 'width:100px; background-color:red;'
  ```

  @method css
  @for utils.computed
  @param {Object} attributes
  @return {Ember.ComputedProperty} create a css string based on `attributes`
*/
export default function css(attributes) {
  var keys = Object.keys(attributes);
  var args = keys.map((key) => { return attributes[key]; });

  args.push(function() {
    return new Ember.Handlebars.SafeString(keys.reduce((acc, key) => {
      var prop = attributes[key];
      return `${acc} ${key}:${this.get(prop)};`;
    }, ''));
  });

  return Ember.computed(...args);
}
