import Ember from 'ember';

import { EKMixin, EKOnInsertMixin, keyDown } from 'ember-keyboard';

export default Ember.TextField.extend(
  EKMixin,
  EKOnInsertMixin, {
  classNames: ['MixBuilderTextInput'],

  _blurInput: Ember.on(keyDown('Enter'), function() {
    this.$().blur();
  }),
});

