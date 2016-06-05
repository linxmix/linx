import Ember from 'ember';

import OneWayInput from 'ember-one-way-controls/components/one-way-input';
import { EKMixin, EKOnInsertMixin, keyDown } from 'ember-keyboard';

export default OneWayInput.extend(
  EKMixin,
  EKOnInsertMixin, {
  classNames: ['MixBuilderInput'],

  _blurInput: Ember.on(keyDown('Enter'), function() {
    this.$().blur();
  }),
});

