import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['ArrangementRow'],
  classNameBindings: ['isMini:ArrangementRow--mini'],

  // optional params
  model: null,
  size: '',

  isMini: Ember.computed.equal('size', 'mini')
});
