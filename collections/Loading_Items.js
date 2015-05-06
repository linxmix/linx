/* global LoadingItems: true */
/* global LoadingItemModel: true */
/* global COMMANDS: true */
/* global ON_COMMAND_SUCCESS: true */

Meteor.startup(function() {
  if (Meteor.isClient) {
    COMMANDS = {
      set: function(_id, commandFn) {
        if (this[_id]) {
          this.destroy(_id);
        }
        this[_id] = new ReactiveVar(commandFn);
      },
      get: function(_id) {
        var commandFn = this[_id];
        return commandFn && commandFn.get();
      },
      destroy: function(_id) {
        delete this[_id];
      }
    };
    ON_COMMAND_SUCCESS = {
      set: function(_id, onSuccess) {
        if (this[_id]) {
          this.destroy(_id);
        }
        this[_id] = new ReactiveVar(onSuccess);
      },
      get: function(_id) {
        var onSuccess = this[_id];
        return onSuccess && onSuccess.get();
      },
      destroy: function(_id) {
        delete this[_id];
      }
    };
  }
});

LoadingItemModel = Graviton.Model.extend({
  defaults: {
    activeText: 'Loading...',
    successText: 'Finishing...',
    result: undefined,
    percent: 0,
  }
}, {
  onSuccess: function(cb) {
    this._setOnSuccess(Utils.chain(this._getOnSuccess(), cb));
  },

  _getOnSuccess: function() {
    return ON_COMMAND_SUCCESS.get(this.get('_id'));
  },

  _setOnSuccess: function(onSuccess) {
    ON_COMMAND_SUCCESS.set(this.get('_id'), onSuccess);
  },

  getCommand: function() {
    return COMMANDS.get(this.get('_id'));
  },

  setCommand: function(command) {
    COMMANDS.set(this.get('_id'), command);
  },

  runCommand: function() {
    var loadingItemModel = this;
    var command = this.getCommand();

    command({
      onSuccess: this._getOnSuccess(),
      onProgress: function(percent) {
        loadingItemModel.set('percent', percent);
      },
    });
  },
});

LoadingItems = Graviton.define("loadingitems", {
  modelCls: LoadingItemModel,
  timestamps: true,
  persist: false,
});
