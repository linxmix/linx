import Ember from 'ember';
import { beforeEach } from 'mocha';

export default function(fn) {
  beforeEach(function() {
    Ember.run(() => {
      fn.call(this);
    });
  });
}
