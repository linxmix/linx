import Ember from 'ember';

export default Ember.Mixin.create({
  assertParams: function() {
    this.get('params').forEach((param) => {
      Ember.assert('Must specify a ' + param, this.get(param));
    });
  }.on('init'),
});
