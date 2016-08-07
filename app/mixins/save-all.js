import Ember from 'ember';

import { task, timeout, didCancel } from 'ember-concurrency';

const {
  get,
  computed
} = Ember;

export const AUTOSAVE_THROTTLE_INTERVAL = 2000;

function _ignoreCancellationErrors(e) {
  const isTaskCancelationError = didCancel(e);
  if (!isTaskCancelationError) {
    return Ember.RSVP.reject(e);
  }
}

function invoke(objectOrProxy, method, ...args) {
  return Ember.RSVP.resolve(objectOrProxy).then(content => content[method](...args));
}

export default Ember.Mixin.create({
  // Required: An array of all models in the card graph that the container is responsible
  // for persisting
  allModelsToSave: null,

  _operations: [],

  _throttledSaveAllTask: task(function * () {
    yield timeout(AUTOSAVE_THROTTLE_INTERVAL);
    yield this.saveAll();
  }).keepLatest(),

  _saveAllTask: task(function * () {
    const depthSortedItems = this.get('allModelsToSave').sortBy('meta.depth');
    const remainingDirtyItems = [];
    const operations = this.get('_operations');

    this.set('_operations', []);

    for (let i = 0; i < depthSortedItems.length; i++) {
      const item = depthSortedItems[i];
      if (get(item, 'value.isNew') && get(item, 'meta.isParent')) {
        yield invoke(item.value, 'save');
      } else if (get(item, 'value.hasDirtyAttributes')) {
        remainingDirtyItems.push(item.value);
      }
    }


    yield Ember.RSVP.all(
      remainingDirtyItems.map((model) => {
        if (!get(model, 'isDeleted')) {
          return invoke(model, 'save');
        }
      }).concat(operations.map((fn) => {
        return fn();
      }))
    );
  }).keepLatest(),

  // The throttle is waiting when the throttle task runs and the save all task
  // is not running. This is useful knowledge because performing another
  // throttled save while the throttle is waiting will add a no-op task to the
  // queue and make the `isWaiting` property wait on that task to complete.
  _isThrottleWaiting: computed(
    '_throttledSaveAllTask.isRunning',
    '_saveAllTask.isRunning',
    function() {
      return this.get('_throttledSaveAllTask.isRunning') && !this.get('_saveAllTask.isRunning');
  }),

  isSaving: computed.or(
    '_throttledSaveAllTask.isRunning',
    '_saveAllTask.isRunning',
    '_saveDeletedModelTask.isRunning'
  ),

  throttledSaveAll(operations) {
    if (!this.get('_isThrottleWaiting')) {
      this.set('_operations', this.get('_operations').concat(operations || []));
      return this.get('_throttledSaveAllTask').perform().catch(_ignoreCancellationErrors);
    } else {
      return Ember.RSVP.resolve();
    }
  },

  // Operations are invoked when save task is performed and may return promises
  // which task will wait for.
  saveAll(operations) {
    this.set('_operations', this.get('_operations').concat(operations || []));
    return this.get('_saveAllTask').perform().catch(_ignoreCancellationErrors);
  },

  // TODO(https://altschool.atlassian.net/browse/ALTOS-8986):
  // Now that we're on Ember 2.4 we should be able to just mark
  // records as deleted and then use the `saveAllTask` to save the graph and
  // persist deletion.
  deleteModel(model) {
    invoke(model, 'deleteRecord');
    return this.get('_saveDeletedModelTask').perform(model);
  },

  // Deleting models requires their own task queue because a deletedRecord is
  // no longer part of the unit graph.
  _saveDeletedModelTask: task(function * (model) {
    yield invoke(model, 'save');
  }).maxConcurrency(3).enqueue()
});
