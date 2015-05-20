import Ember from 'ember';

export default Ember.Mixin.create({
  assertParams: function() {
    this.get('params').forEach((param) => {
      Ember.assert('Must specify a ' + param + ' to use ' + this.get('constructor'), this.get(param));
    });
  }.on('init'),
});
