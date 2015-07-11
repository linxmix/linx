import Ember from 'ember';
import DS from 'ember-data';

export default DS.FirebaseSerializer.extend({

  // Patch polymorphism until part of Ember Firebase. https://github.com/firebase/emberfire/issues/245
  serializePolymorphicType: function(snapshot, json, relationship) {
    var key = relationship.key,
        belongsTo = snapshot.belongsTo(key);
    key = this.keyForAttribute ? this.keyForAttribute(key, "serialize") : key;

    if (!Ember.isNone(belongsTo)) {
      json[key + "Type"] = belongsTo.modelName;
    }

    return this._super.apply(this, arguments);
  },

});
