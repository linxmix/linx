// credits to https://github.com/robwebdev/ember-cli-echonest
import DS from 'ember-data';
import Ember from 'ember';

/**
  @class EchonestSerializer
  @constructor
  @extends DS.RESTSerializer
*/

export default DS.RESTSerializer.extend({
  /**
    Normalize all payloads, removing "response" namespace and "status" property

    @method normalizeResponse
    @param {Object} payload
    @return {Object} the normalized payload
  */

  normalizeResponse: function(store, primaryModelClass, payload, id, requestType) {
    var normalized = {};
    delete payload.response.status;

    Object.keys(payload.response).forEach(function (key) {
      normalized['echonest/%@'.fmt(key)] = payload.response[key];
    });

    return this._super(store, primaryModelClass, normalized, id, requestType);
  },

  normalizeHash: {
    /**
      Normalize artist payloads, adding a 'links' object with url for similar artists
      @method echonest_artist
      @param {Object} hash
      @return {Object} hash
    */
    echonest_artist: function (hash) {
      hash.links = {
        similar: 'artist/similar'
      };

      return hash;
    },

    /**
      Normalize song payloads, renaming 'artist_id' to 'artist'.
      @method echonest_artist
      @param {Object} hash
      @return {Object} hash
    */
    echonest_song: function (hash) {
      hash.artist = hash.artist_id;
      delete hash.artist_id;
      return hash;
    },

    /**
      Normalize track payloads, renaming 'song_id' to 'song'.
      @method echonest_track
      @param {Object} hash
      @return {Object} hash
    */
    echonest_track: function (hash) {
      hash.song = hash.song_id;
      delete hash.song;
      return hash;
    }
  }
});
