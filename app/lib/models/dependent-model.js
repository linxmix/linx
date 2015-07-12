import Ember from 'ember';
import DS from 'ember-data';

// adds properties which auto-create the dependent models
export default function(...typeKeys) {
  var privateKeys = typeKeys.map((typeKey) => { return '_' + typeKey; });

  var params = typeKeys.reduce((params, typeKey, i) => {
    var privateKey = privateKeys[i];
    var cacheKey = privateKey + '_cached';

    // setup private relationship
    params[privateKey] = DS.belongsTo(typeKey, { async: true });

    // setup public computed property:
    // return relationship if exists, else create
    params[typeKey] = Ember.computed('isLoaded', privateKey, function() {
      var typeId = this.get('_data.' + privateKey);

      // TODO(AFTERPROMISE): refactor this
      var cached;
      while (!(cached = this.get(cacheKey))) {
        this.set(cacheKey, DS.PromiseObject.create({
          promise: new Ember.RSVP.Promise((resolve, reject) => {

            // if we dont have this model, create one and save it
            if (this.get('isLoaded') && !typeId) {
              var model = this.get('store').createRecord(typeKey);
              this.set(privateKey, model);
              resolve(model);
            } else {
              this.get(privateKey).then(resolve, reject);
            }
          }),
        }));
      }

      return cached
    });

    return params;
  }, {});

  // augment save to also save the dependent models
  params.save = function() {
    var promises = typeKeys.map((typeKey, i) => {
      return this.get(typeKey).then((model) => {
        return model && model.save();
      });
    });

    promises.push(this._super.apply(this, arguments));
    return Ember.RSVP.all(promises);
  };

  // augment destroyRecord to destroy the dependent models
  params.destroyRecord = function() {
    var promises = typeKeys.map((typeKey) => {
      return this.get(typeKey).then((model) => {
        return model && model.destroyRecord();
      });
    });

    // once dependent models are destroyed, destroy this model
    promises.push(this._super.apply(this, arguments));
    return Ember.RSVP.all(promises);
  };

  // anyDirty returns true if this model or any dependent model isDirty
  var anyDirtyProperties = privateKeys.map((privateKey) => { return privateKey + '.isDirty'; });
  anyDirtyProperties.push('isDirty');
  params.anyDirty = Ember.computed.any.apply(Ember, anyDirtyProperties);

  return Ember.Mixin.create(params);
};
