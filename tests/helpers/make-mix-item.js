import Ember from 'ember';
import DS from 'ember-data';

export default function() {
  let arrangement = this.factory.make('arrangement');

  let mix = this.factory.make('mix', {
    _arrangement: arrangement
  });

  return { mix, arrangement };
}
