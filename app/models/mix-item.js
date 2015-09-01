import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

export default DS.Model.extend(
  OrderedHasManyItemMixin('mix'),
  DependentRelationshipMixin('clip'), {

  mix: DS.belongsTo('mix', { async: true }),

  // TODO(POLYMORPHISM)
  clip: Ember.computed.or('trackClip', 'transitionClip', 'mixClip'),
  clipModel: Ember.computed.reads('clip.model'),
  clipModelName: Ember.computed.reads('clip.constructor.modelName'),

  trackClip: DS.belongsTo('track-clip', { async: true }),
  transitionClip: DS.belongsTo('transition-clip', { async: true }),
  mixClip: DS.belongsTo('mix-clip', { async: true }),

  destroyClip() {
    return this.get('clip').then((clip) => {
      return clip && clip.destroyRecord();
    });
  },

  isTrack: Ember.computed.equal('clipModelName', 'track-clip'),
  isTransition: Ember.computed.equal('clipModelName', 'transition-clip'),
  isMix: Ember.computed.equal('clipModelName', 'mix-clip'),

  setModel(model) {
    return this.destroyClip().then(() => {
      return this.get('mix.arrangement').then((arrangement) => {
        let modelName = model.get('constructor.modelName');
        let clipModelName = `${modelName}-clip`;
        let clipModelPath = Ember.String.camelize(clipModelName);

        let clip = this.get('store').createRecord(clipModelName, {
          mixItem: this,
          model,
          arrangement
        });

        // add clip to item
        this.set(clipModelPath, clip);

        // add clip to arrangement
        arrangement.get(`${clipModelPath}s`).addObject(clip);

        return this;
      });
    });
  },

  save() {
    console.log('save mix item');
    return this._super.apply(this, arguments);
  },

  destroyRecord() {
    console.log('destroy mix item');
    return this._super.apply(this, arguments);
  }
});
