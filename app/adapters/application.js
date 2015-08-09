import Ember from 'ember';
import FirebaseAdapter from 'emberfire/adapters/firebase';
import config from '../config/environment';
import DS from 'ember-data';

const { inject } = Ember;

let adapter;

// TODO(DBSTUB)
// if (config.environment == "test") {
//   adapter = DS.RESTAdapter.extend()
// } else {
  adapter = FirebaseAdapter.extend({
    firebase: inject.service(),
  });
// }

export default adapter;
