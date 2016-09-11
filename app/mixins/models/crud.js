import Ember from 'ember';
import DS from 'ember-data';

// adds basic crud fields to model
export default Ember.Mixin.create({
  createdBy: DS.attr('string'), // firebase user uid
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  _setCreatedInfo: Ember.on('didCreate', function() {
    this.setProperties()
  }),

  firebaseApp: Ember.inject.service(),
  userSession: Ember.inject.service(),

  save() {
    const uid = this.get('userSession.currentUser.uid');

    if (this.get('isNew')) {
      this.setProperties({
        createdBy: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (!this.get('isDeleted')) {
      this.setProperties({
        updatedAt: new Date(),
      });
    }

    return this._super.apply(this, arguments);
  },
});
