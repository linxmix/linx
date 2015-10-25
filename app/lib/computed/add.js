import Ember from 'ember';

import { isString, arraySum } from 'linx/lib/utils';

// totalSquares: add('redSquares.length', 'blueSquares.length', 3)
export default function(...args) {
  let props = args.filter((arg) => {
    return isString(arg);
  });
  let sumConsts = arraySum(args.filter((arg) => {
    return !isString(arg);
  }));

  return Ember.computed.apply(Ember, props.concat(function() {
    let sumProps = arraySum(props.map((prop) => {
      return this.get(prop);
    }));

    return sumProps + sumConsts;
  }));
}
