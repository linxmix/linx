/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Search');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks_List = require('../track/Tracks_List');
var SearchBar = require('./SearchBar');

var Track = require('../../models/Track');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function () {
    return {
      'searchText': '',
      'searchGenres': [],
      'searchTags': [],
      'searchResults': [],
    }
  },

  executeSearch: function () {
    var options = {
      'q': this.state.searchText ? this.state.searchText : null,
      'genres': this.state.searchGenres.split(','),
      'tags': this.state.searchTags.split(','),
      'filter': 'streamable', // only return results we can stream
    }
    debug("executing search", options);
    SC.get('/tracks', options, function(tracks) {
      // curry tracks into models
      var trackModels = tracks.map(function (track) {
        return new Track(track);
      })
      this.setState({
        'searchResults': trackModels,
      });
    }.bind(this));
  },

  handleUserInput: function (options) {
    this.setState({
      'searchText': options.searchText,
      'searchGenres': options.searchGenres,
      'searchTags': options.searchTags,
    });
  },

  render: function () {

    /*
    this.props.collection.echoNest.searchSongs({
      'query': {},
      'success': function (collection, response, options) {
        console.log("SUCCESS", collection, response, options);
      },
    });
    */

    return (
      <div className="ui grid">
        <div className="sixteen wide column">
          {SearchBar({
            'searchText': this.state.searchText,
            'searchGenres': this.state.searchGenres,
            'searchTags': this.state.searchTags,
            'handleUserInput': this.handleUserInput,
            'executeSearch': this.executeSearch,
          })}
        </div>
        <div className="sixteen wide column">
          {Tracks_List({
            'tracks': this.state.searchResults,
            'changePlayState': this.props.changePlayState,
          })}
        </div>
      </div>
    );
  },

});