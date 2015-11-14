import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from '../readiness';

import withDefault from 'linx/lib/computed/with-default';

export default function(listPropertyPath) {
  let mixinParams = {
    _items: withDefault(`${listPropertyPath}.items`, []),

    listReadyPromise: Ember.computed.reads(`${listPropertyPath}.readyPromise`),

    order: DS.attr('number'),
    isRemoved: DS.attr('boolean', { defaultValue: false }),

    index: function() {
      let items = this.get('_items');
      return items.indexOf(this);
    }.property('_items.[]'),

    position: function() {
      return this.get('index') + 1;
    }.property('index'),

    nextItem: function() {
      return this.get('_items').objectAt(this.get('index') + 1);
    }.property('index', '_items.[]'),

    prevItem: function() {
      return this.get('_items').objectAt(this.get('index') - 1);
    }.property('index', '_items.[]'),

    isFirstItem: Ember.computed.not('prevItem'),
    isLastItem: Ember.computed.not('nextItem'),

    // // save only after finishing loading
    // save: function() {
    //   // TODO: why does this happen? how to fix?
    //   if (this.get('isLoaded')) {
    //     return this._super.apply(this, arguments);
    //   } else {
    //     return new Ember.RSVP.Promise((resolve, reject) => {
    //       this.one('didLoad', () => {
    //         DS.Model.prototype.save.apply(this).then(resolve, reject);
    //       });
    //     });
    //   }
    // },

    destroyRecord: function() {
      // remove from list before destroying
      try {
        this.get(listPropertyPath).removeObject(this);
      } catch (e) {
      }

      return this._super.apply(this, arguments);
    },
  };

  // implement readiness mixin
  let readinessKey = `${listPropertyPath}_isReady`;
  mixinParams[readinessKey] = Ember.computed(`${listPropertyPath}.isLoaded`, `${listPropertyPath}.id`, function() {
    let list = this.get(listPropertyPath);

    return !list || !list.get('id') || list.get('isLoaded');
  });

  return Ember.Mixin.create(ReadinessMixin(readinessKey), mixinParams);
}
