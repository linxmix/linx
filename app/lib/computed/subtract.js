import Ember from 'ember';
import _ from 'npm:underscore';

// remainingSquares: subtract('squares.length', 'removedSquares.length')
export default function(...props) {
  return Ember.computed.apply(Ember, props.concat(function() {
    return _.rest(props).reduce((remaining, prop) => {
      return remaining - this.get(prop);
    }, this.get(props.get('firstObject')));
  }));
}
