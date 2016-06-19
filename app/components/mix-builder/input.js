import Ember from 'ember';

import OneWayInput from 'ember-one-way-controls/components/one-way-input';
import { EKMixin, EKOnFocusMixin, keyDown } from 'ember-keyboard';

export default OneWayInput.extend(
  EKMixin,
  EKOnFocusMixin, {
  classNames: ['MixBuilderInput'],

  _blurInput: Ember.on(keyDown('Enter'), function() {
    this.$().blur();
  }),
});

