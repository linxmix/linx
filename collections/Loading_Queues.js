/* global LoadingQueues: true */
/* global LoadingQueueModel: true */
/* global PowerQueue: false */
/* global POWER_QUEUES: true */

Meteor.startup(function() {
  if (Meteor.isClient) {
    POWER_QUEUES = {
      set: function(_id, powerQueue) {
        if (this[_id]) {
          this.destroy(_id);
        }
        this[_id] = new ReactiveVar(powerQueue);
      },
      get: function(_id) {
        var powerQueue = this[_id];
        return powerQueue && powerQueue.get();
      },
      destroy: function(_id) {
        delete this[_id];
      }
    };
  }
});

LoadingQueueModel = Graviton.Model.extend({
  defaults: {
    activeText: 'Loading...',
    successText: 'Finishing...',
    result: undefined,
    loadingItemIds: [],
  },
}, {
  initQueue: function(options) {
    var queue = new PowerQueue(_.extend({
      isPaused: true,
      autoStart: false,
      maxProcessing: 1,
    }, options));

    POWER_QUEUES.set(this.get('_id'), queue);
    return queue;
  },

  queueItems: function(loadingItems) {
    var loadingQueueModel = this;
    var queue = this.getQueue();

    var loadingItemIds = this.get('loadingItemIds');
    loadingItems.forEach(function(loadingItem) {
      loadingItemIds.push(loadingQueueModel.get('_id'));

      queue.add(function(done) {
        console.log("calling function", loadingItem);
        loadingItem.onSuccess(function() {
          console.log("4 finish queue", arguments);
          done();
        });
        loadingItem.runCommand();
      });
    });
    this.set('loadingItemIds', loadingItemIds);
  },

  getProgress: function() {
    var queue = this.getQueue();
    return queue.progress();
  },

  start: function() {
    this.getQueue().run();
  },

  onSuccess: function(cb) {
    var queue = this.getQueue();
    queue.onEnded = Utils.chain(queue.onEnded, cb);
  },

  onSuccessFirst: function(cb) {
    var queue = this.getQueue();
    queue.onEnded = Utils.chain(cb, queue.onEnded);
  },

  getQueue: function() {
    var queue = POWER_QUEUES.get(this.get('_id'));
    if (!queue) {
      queue = this.initQueue();
    }
    return queue;
  },

  getItems: function() {
    return this.get('loadingItemIds').map(function(id) {
      return LoadingItems.findOne(id);
    });
  },

  // TODO: fix
  getCurrentItems: function() {
    var currIndex = this.getCurrentIndex();
    var numProcessing = this.getNumProcessing();

    var currIds = this.get('loadingItemIds').slice(currIndex, currIndex + numProcessing);
    console.log("getCurrentItems", currIndex, numProcessing, currIds);
    return currIds.map(function(id) {
      return LoadingItems.findOne(id);
    });
  },

  getCurrentIndex: function() {
    return this.getNumComplete();
  },

  getNumProcessing: function() {
    return this.getQueue().processing();
  },

  getNumComplete: function() {
    return this.getNumTotal() - this.getNumRemaining();
  },

  getNumRemaining: function() {
    return this.getQueue().length();
  },

  getNumTotal: function() {
    return this.getQueue().total();
  },
});

LoadingQueues = Graviton.define("loadingqueues", {
  modelCls: LoadingQueueModel,
  timestamps: true,
  persist: false,
});
