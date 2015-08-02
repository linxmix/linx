import Ember from 'ember';
import DS from 'ember-data';

import { assertPromise } from 'linx/lib/utils';

// seeds store with test data
export default function() {
  console.log("seed server", server);
  DS.Model.reopenClass({
    save() { assertPromise(this); }
  });

  // audio-meta-1


}
