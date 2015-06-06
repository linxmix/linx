import Ember from 'ember';
import DS from 'ember-data';

// adds properties which auto-create the dependent models
export default function() {
  var typeKeys = Array.prototype.slice.call(arguments);
  var privateKeys = typeKeys.map((typeKey) => { return '_' + typeKey; });

  var params = typeKeys.reduce((params, typeKey, i) => {
    var privateKey = privateKeys[i];

    // setup private relationship
    params[privateKey] = DS.belongsTo(typeKey, { async: true });

    // setup public computed property, return relationship if exists, else create
    params[typeKey] = Ember.computed('isLoaded', privateKey, function() {
      var typeId = this.get('_data.' + privateKey);

      // if we dont have this model, create one
      if (this.get('isLoaded') && !typeId) {
        var model = this.get('store').createRecord(typeKey);
        this.set(privateKey, model);
      }

      return this.get(privateKey);
    });

    return params;
  }, {});

  // augment save to save the dependent models
  params.save = function() {
    var promises = privateKeys.map((privateKey) => {
      var model = this.get(privateKey + '.content');
      return model && model.save();
    });
    promises.push(this._super.apply(this, arguments));
    return Ember.RSVP.all(promises);
  };

  // augment destroyRecord to destroy the dependent models
  params.destroyRecord = function() {
    var promises = privateKeys.map((privateKey) => {
      var model = this.get(privateKey + '.content');
      return model && model.destroyRecord();
    });
    promises.push(this._super.apply(this, arguments));
    return Ember.RSVP.all(promises);
  };

  // anyDirty returns true if this model or any dependent model isDirty
  var anyDirtyProperties = privateKeys.map((privateKey) => { return privateKey + '.isDirty'; });
  anyDirtyProperties.push('isDirty');
  params.anyDirty = Ember.computed.any.apply(Ember, anyDirtyProperties);

  return Ember.Mixin.create(params);
};
