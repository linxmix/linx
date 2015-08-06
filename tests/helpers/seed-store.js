import Ember from 'ember';
import DS from 'ember-data';

import { assertPromise } from 'linx/lib/utils';

// seeds store with test data
export default function(store) {
  console.log("seed store");
  DS.Model.reopenClass({
    save() { assertPromise(this); }
  });

  // server.create('track');
  // store.find('track', 1).then(function(track1) {
  //   track1 = track;
  //   track.get('audioMeta').then(function(audioMeta) {
  //     audioMeta1 = audioMeta;
  //     done();
  //   });
  // });
  // audio-meta-1


}
