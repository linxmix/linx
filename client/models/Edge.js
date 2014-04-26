var Backbone = require('backbone');
var debug = require('debug')('models:Edge')

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'in': null,
      'edgeId': null,
      'out': null,
      'endIn': null,
      'startEdge': null,
      'endEdge': null,
      'startOut': null,
    }
  },

  sync: function (method, edge, options) {
    debug("calling sync", arguments);
    Backbone.sync.apply(this, arguments);
  },

  parse: function (response) {
    // convert dbEdge to queryEdge
    renameProperty.call(response, 'subject', 'in');
    renameProperty.call(response, 'object', 'out');
    renameProperty.call(response, 'predicate', 'edgeId');
    // add id if there was an edgeId
    response['id'] = response['edgeId'];
    return response;
  },

  'urlRoot': '/edges',
});

renameProperty = function (oldName, newName) {
  // Check for the old property name to avoid a ReferenceError in strict mode.
  if (this.hasOwnProperty(oldName)) {
    this[newName] = this[oldName];
    delete this[oldName];
  }
  return this;
};