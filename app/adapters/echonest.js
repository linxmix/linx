// credits to https://github.com/robwebdev/ember-cli-echonest
import DS from 'ember-data';
import ajax from 'ic-ajax';
import Ember from 'ember';
import config from '../config/environment';

/**
  @module Adapters
*/

/**
  @class EchonestAdapter
  @constructor
  @extends DS.RESTAdapter
*/

export default DS.RESTAdapter.extend({
  defaultSerializer: 'echonest',
  ajax: ajax,
  host: config.echonest && config.echonest.host ||  'http://developer.echonest.com',
  namespace: config.echonest && config.echonest.namespace || 'api/v4',
  api_key: config.echonest && config.echonest.api_key || config.ECHONEST_APIKEY,

  /**
    Called by 'find' and 'findQuery' and performs an HTTP `GET` request with default params
    'api_key', 'format' and 'bucket' as required by the Echonest API, detailed here:
    http://developer.echonest.com/docs/v4#standard-parameters

    'dataType' and 'traditional' are added to the options object passed to 'ajax', along with data and type.
    The traditional flag is set to true to format query strings how the Echonest API expects them

    'bucket' is passed as into 'data' if available, if not is is taken from the model.

    @method get
    @param {subclass of DS.Model} type
    @param {String} url
    @param {object} data
    @param {Array} [bucket]
    @return {Promise} promise
  */

  get: function (type, url, data, bucket) {
    data = Ember.merge({
      api_key: this.api_key,
      format: 'json',
      bucket: bucket || type.proto().bucket
    }, data);

    return this.ajax({
      url: url,
      data: data,
      traditional: true
    });
  },

  /**
    Overrides DS.RESTAdapter.pathForType to return the 'type' argument with 'echonest' stripped out
    Called by buildURL

    @method pathForType
    @param {String} type
    @return {String} path
  */

  pathForType: function (type) {
    var splitType = type.split('echonest');
    if (splitType.length > 1) {
      return splitType[1].toLowerCase();
    }

    return type;
  },

  /**
    Overrides DS.RESTAdapter.find to call 'get' with a url and query containing
    the required record's ID

    @method find
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {String} id
    @return {Promise} promise
  */

  find: function(store, type, id) {
    var query = {
      id: id
    };

    return this.get(type, [this.buildURL(type.typeKey), 'profile'].join('/'), query);
  },

  /**
    Overrides DS.RESTAdapter.findQuery to call 'get' with a url and query

    @method findQuery
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {object} query
    @return {Promise} promise
  */

  findQuery: function(store, type, query) {
    return this.get(type, [this.buildURL(type.typeKey), 'search'].join('/'), query);
  },

  /**
    Overrides DS.RESTAdapter.findHasMany to call 'get' with a url and query

    @method findHasMany
    @param {DS.Store} store
    @param {DS.Model} record
    @param {String} url
    @return {Promise} promise
  */

  findHasMany: function (store, record, url) {
    var type = record.constructor;
    return this.get(type, [this.buildURL(), url].join('/'), {id: record.get('id')});
  },

  /**
    Overrides DS.RESTAdapter.createRecord and throws an error

    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
  */

  createRecord: function (store, type) {
    throw 'You cannot create an %@'.fmt(type.typeKey);
  },

  /**
    Overrides DS.RESTAdapter.deleteRecord and throws an error

    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
  */

  deleteRecord: function(store, type, record) {
    throw 'You cannot delete an %@'.fmt(type.typeKey);
  },

  /**
    Overrides DS.RESTAdapter.updateRecord and throws an error

    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
  */

  updateRecord: function(store, type, record) {
    throw 'You cannot update an %@'.fmt(type.typeKey);
  }
});
