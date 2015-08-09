import Ember from 'ember';
import DS from 'ember-data';

export default function(listType) {
  var mixinParams = {
    list: DS.belongsTo(listType, { async: true }),

    index: function() {
      var list = this.get('list');
      return list.get('items').indexOf(this);
    }.property('list.items.[]'),

    position: function() {
      return this.get('index') + 1;
    }.property('index'),

    nextItem: function() {
      return this.get('list').objectAt(this.get('index') + 1);
    }.property('index', 'list.items.[]'),

    prevItem: function() {
      return this.get('list').objectAt(this.get('index') - 1);
    }.property('index', 'list.items.[]'),

    // save only after finishing loading
    save: function() {
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
    },

    // remove from list before destroying
    destroyRecord: function() {
      var removePromise = this.get('list').then((list) => {
        return list.removeAt(this.get('index'));
      });

      return Ember.RSVP.all([this._super.apply(this, arguments), removePromise]);
    },
  };

  return Ember.Mixin.create(mixinParams)
};
