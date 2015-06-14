import Ember from 'ember';

export default Ember.Component.extend({

  // params
  isDone: false,
  text: 'Loading...',

  classNames: ['ProgressBar', 'inverted ui segment'],
  classNameBindings: ['isDone:ProgressBar--hidden']
});
