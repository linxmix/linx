import Ember from 'ember';
import DS from 'ember-data';
import FactoryGuy from 'ember-data-factory-guy';

import { asResolvedPromise } from 'linx/lib/utils';

// seeds store with test data
export default function(store) {


  console.log("seed store");
  DS.Model.reopenClass({
    save() { asResolvedPromise(this); }
  });

  // TODO: why need to do this?
  // FactoryGuy.setStore(store);
  // var track = FactoryGuy.make('giveitupforlove');
  // return asResolvedPromise(track);
  return FactoryGuy.getStore();
  // return track.get('audioMeta');

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
