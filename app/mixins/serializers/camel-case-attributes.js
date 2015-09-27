import Ember from 'ember';

export default Ember.Mixin.create({
  keyForAttribute: function(attr, method) {
    return Ember.String.underscore(attr);
  }
});
