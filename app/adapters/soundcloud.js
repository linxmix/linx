import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';
import ajax from 'ic-ajax';

/**
  @module Adapters
*/

/**
  @class SoundcloudAdapter
  @constructor
  @extends DS.RESTAdapter
*/

export default DS.RESTAdapter.extend({
  defaultSerializer: 'soundcloud',
  soundcloud: Ember.inject.service(),

  /**
    Overrides DS.RESTAdapter.pathForType to return the 'type' argument with 'soundcloud' stripped out
    Called by buildURL

    @method pathForType
    @param {String} type
    @return {String} path
  */

  pathForType: function (type) {
    let splitType = type.split('soundcloud/');
    if (splitType.length > 1) {
      splitType = splitType[1].toLowerCase();
    }

    return Ember.String.pluralize(splitType);
  },

  /**
    Overrides DS.RESTAdapter.findRecord to call 'soundcloud.getAjax' with a url

    @method findRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {String} id
    @return {Promise} promise
  */

  findRecord: function(store, type, id) {
    return this.get('soundcloud').getAjax(this.buildURL(type.modelName, id));
  },

  /**
    Overrides DS.RESTAdapter.query to call 'soundcloud.getAjax' with a url and query

    @method query
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {object} query
    @return {Promise} promise
  */

  query: function(store, type, query) {
    return this.get('soundcloud').getAjax(this.buildURL(type.modelName), query);
  },

  /**
    Overrides DS.RESTAdapter.queryRecord to call 'soundcloud.getAjax' with a url and query

    @method queryRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {object} query
    @return {Promise} promise
  */

  queryRecord: function(store, type, query = {}) {
    const soundcloud = this.get('soundcloud');

    if ((type.modelName === 'soundcloud/track') && (query.resolveUrl)) {
      return soundcloud.resolveUrl(query.resolveUrl);
    }

    return soundcloud.getAjax(this.buildURL(type.modelName), query);
  },

  /**
    Overrides DS.RESTAdapter.createRecord and throws an error

    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
  */

  createRecord: function (store, type) {
    throw 'You cannot create an %@'.fmt(type.modelName);
  },

  /**
    Overrides DS.RESTAdapter.deleteRecord and throws an error

    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
  */

  deleteRecord: function(store, type, record) {
    throw 'You cannot delete an %@'.fmt(type.modelName);
  },

  /**
    Overrides DS.RESTAdapter.updateRecord and throws an error

    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
  */

  updateRecord: function(store, type, record) {
    throw 'You cannot update an %@'.fmt(type.modelName);
  }
});
