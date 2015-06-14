import Ember from 'ember';
import DS from 'ember-data';

export default function(listType) {
  var mixinParams = {
    position: function() {
      return this.get('index') + 1;
    }.property('index')
  };

  mixinParams[listType] = DS.belongsTo(listType, { async: true });

  // add index as computedProperty
  mixinParams.index = Ember.computed(listType + '.content.[]', function() {
    // TODO: why is item.list !== list?
    var list = this.get(listType);
    return list.get('content').indexOf(this);
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
