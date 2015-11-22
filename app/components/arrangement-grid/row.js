import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['ArrangementGridRow'],
  classNameBindings: ['isMini:ArrangementGridRow--mini'],

  // optional params
  model: null,
  size: '',

  isMini: Ember.computed.equal('size', 'mini')
});
