// credits to https://github.com/robwebdev/ember-cli-echonest
import EchonestAdapter from '../echonest';

/**
  @module Adapters
*/

/**
  @class EchonestSongAdapter
  @constructor
  @extends EchonestAdapter
*/
export default EchonestAdapter.extend({

  /**
    Overrides EchonestAdapter.findQuery.
    Call 'getPlaylist' if 'playlist' is present in 'query',
    otherwise calls the _super method.
    @method findQuery
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {object} query
    @return {Promise} promise
  */
  findQuery: function(store, type, query) {
    var args = Array.prototype.slice.call(arguments, 0);
    if (query.playlist) {
      return this.getPlaylist.apply(this, args);
    } else {
      return this._super.apply(this, args);
    }
  },

  /**
    Different types of playlist accept different types of buckets.
    This hook will handle this later, at the moment it returns a hardcoded array
    @method bucketForPlaylist
    @param {String} playlistType
    @return {Array} bucket
  */
  bucketForPlaylist: function (playlistType) {
    // TODO: return different bucket arrays based on the playlistType
    // TODO: make sure playlist buckets can be overriden easily, ie defined as a property on
    // the adapter rather than in this methods scope
    return [];
  },

  /**
    Makes a call to 'get' with a url built using the return value of buildURL and the 'playlist' param.
    Removes 'playlist' from 'query' as this is used internally to the adapter and nolonger needed.
    Although we are fetching songs, playlist API endpoints fewer 'buckets', which are returned by 'bucketForPlaylist'
    @method getPlaylist
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {object} query
    @return {Promise} promise
  */
  getPlaylist: function (store, type, query) {
    var playlistType = query.playlist;
    var playlistBucket = this.bucketForPlaylist(playlistType);
    delete query.playlist;
    return this.get(type, [this.buildURL('playlist'), playlistType].join('/'), query, playlistBucket);
  }
});
