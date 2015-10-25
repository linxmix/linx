import Ember from 'ember';

import { isString, arrayProduct } from 'linx/lib/utils';

// totalSquares: multiply('redSquares.length', 'blueSquares.length', 3)
export default function(...args) {
  let props = args.filter((arg) => {
    return isString(arg);
  });
  let productConsts = arrayProduct(args.filter((arg) => {
    return !isString(arg);
  }));

  return Ember.computed.apply(Ember, props.concat(function() {
    let productProps = arrayProduct(props.map((prop) => {
      return this.get(prop);
    }));

    return productProps * productConsts;
  }));
}
