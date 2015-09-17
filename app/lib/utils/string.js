import Ember from 'ember';

export function pluralize(length, single, plural) {
  plural = plural || single + 's';

  Ember.assert('pluralize requires a singular string', single);
  Ember.assert('pluralize requires a length', !Ember.isNone(length));

  return (length === 1) ? single : plural;
}
