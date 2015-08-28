import Ember from 'ember';

// totalSquares: add('redSquares.length', 'blueSquares.length')
export default function(...props) {
  return Ember.computed.apply(Ember, props.concat(function() {
    return props.reduce((sum, prop) => { return sum + this.get(prop); }, 0);
  });
}
