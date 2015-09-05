import Ember from 'ember';
import DS from 'ember-data';

export default function() {
  let mix = this.factory.make('mix');

  // make withDefaultModel think mix has arrangement
  mix.set('_data', {
    _arrangement: 1
  });

  let arrangement = this.factory.make('arrangement', {
    mixes: [mix],
  });

  return { mix, arrangement };
}
