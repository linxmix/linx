import Ember from 'ember';

export default {
  name: 'store-patch',
  after: 'store',

  initialize: function(container) {
    console.log("initialize store");
    var store = container.lookup('store:main');

    // Patch polymorphism until part of Ember Firebase. https://github.com/firebase/emberfire/issues/245
    store.reopen({
    //   findPolymorphic: function(type, query) {
    //     var store = this;

    //     return store.find.call(this, type, query).then(function(model) {
    //       var polyType = model.get('polyType');
    //       var polyId = model.get('_data.' + polyProp);
    //       // debugger;
    //       return store.find(polyType, polyId).then(function(polyModel) {
    //         model.set(polyProp, polyModel);
    //         return model;
    //       });
    //     });
    //   },

    //   deserializeRecordId: function(store, data, key, relationship, id) {
    //     console.log("DESERIALIZE", store, data, key, relationship, id);
    //     return this._super.apply(this, arguments);
    //   },

    //   // http://lukegalea.github.io/ember_data_polymorphic_presentation/#/39
    //   push: function(typeName, data, _partial) {
    //     console.log("PUSH", typeName, data, _partial);


    // Ember.assert("Expected an object as `data` in a call to `push` for " + typeName + " , but was " + data, Ember.typeOf(data) === 'object');
    // Ember.assert("You must include an `id` for " + typeName + " in an object passed to `push`", data.id != null && data.id !== '');

    // var type = this.modelFor(typeName);
    // var filter = Ember.EnumerableUtils.filter;

    // // If Ember.ENV.DS_WARN_ON_UNKNOWN_KEYS is set to true and the payload
    // // contains unknown keys, log a warning.
    // if (Ember.ENV.DS_WARN_ON_UNKNOWN_KEYS) {
    //   Ember.warn("The payload for '" + type.typeKey + "' contains these unknown keys: " +
    //     Ember.inspect(filter(Ember.keys(data), function(key) {
    //       return !(key === 'id' || key === 'links' || get(type, 'fields').has(key) || key.match(/Type$/));
    //     })) + ". Make sure they've been defined in your model.",
    //     filter(Ember.keys(data), function(key) {
    //       return !(key === 'id' || key === 'links' || get(type, 'fields').has(key) || key.match(/Type$/));
    //     }).length === 0
    //   );
    // }

    // // Actually load the record into the store.

    // this._load(type, data);

    // var record = this.recordForId(type, data.id);
    // var store = this;


    //     console.log("PUSH", record, type, data);

    //     // debugger

    // this._backburner.join(function() {
    //   store._backburner.schedule('normalizeRelationships', store, '_setupRelationships', record, type, data);
    // });

    // return record;

        // var dataType, modelType, oldRecord, oldType;

        // modelType = oldType = type;
        // dataType = data.type;

        // if (dataType && (this.modelFor(oldType) !== this.modelFor(dataType))) {
        //   modelType = dataType;

        //   if (oldRecord = this.getById(oldType, data.id)) {
        //     this.dematerializeRecord(oldRecord);
        //   }
        // }

        // return this._super.call(this, this.modelFor(modelType), data, _partial);
      // },

    });
  }
};
