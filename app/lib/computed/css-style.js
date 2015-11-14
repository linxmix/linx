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
export default function cssStyle(attributes) {
  let keys = Object.keys(attributes);
  let args = keys.map((key) => { return attributes[key]; });

  args.push(function() {
    return cssToString(keysToCssAttrs(this, keys, attributes));
  });

  return Ember.computed(...args);
}

// Same as above, except it calls this.$(selector).animate(cssAttrs)
export function animateStyle(attributes, selector = '') {
  let keys = Object.keys(attributes);
  let args = keys.map((key) => { return attributes[key]; });

  args.push(function() {
    let cssAttrs = keysToCssAttrs(this, keys, attributes);
    this.$(selector).animate(cssAttrs);
  });

  return Ember.observer(...args).on('didInsertElement');
}

function cssToString(attributes) {
  return new Ember.Handlebars.SafeString(Object.keys(attributes).reduce((acc, key) => {
    let attribute = attributes[key];
    return `${acc} ${key}:${attribute};`;
  }, ''));
}

function keysToCssAttrs(context, keys, attributes) {
  return keys.reduce((cssAttrs, key) => {
    cssAttrs[key] = context.get(attributes[key]);
    return cssAttrs;
  }, {});
}
