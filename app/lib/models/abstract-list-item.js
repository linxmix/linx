import Ember from 'ember';
import DS from 'ember-data';

export default function(listType) {
  var mixinParams = {
    position: function() {
      return this.get('index') + 1;
    }.property('index')
  };

  mixinParams.list = DS.belongsTo(listType, { async: true });

  // add index as computedProperty
  mixinParams.index = Ember.computed('list.items.[]', function() {
    var list = this.get('list');
    return list.get('items').indexOf(this);
  });

  // save only after finishing loading
  mixinParams.save = function() {
    // TODO: why does this happen? how to fix?
    if (this.get('isLoaded')) {
      return this._super.apply(this, arguments);
    } else {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.one('didLoad', () => {
          DS.Model.prototype.save.apply(this).then(resolve, reject);
        });
      });
    }
  };

  return Ember.Mixin.create(mixinParams)
};
