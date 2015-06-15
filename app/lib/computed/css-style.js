import Ember from 'ember';
import _ from 'npm:underscore';

export default function css(attributes) {
  var args = _.values(attributes);

  console.log('cssstyle');

  args.push(function() {
    return  _.reduce(attributes, (acc, value, key)=> {
      return acc + key + ':' + this.get(value) + ';';
    }, '');
  })

  return Ember.computed(...args);
}
