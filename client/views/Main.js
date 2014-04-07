/** @jsx React.DOM */
var debug = require('debug')('views:Main')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('./pages/Me');
var Mixes = require('./pages/Mixes');
var TasteProfiles = require('./pages/TasteProfiles');
var Search = require('./pages/Search');
var Queue = require('./pages/Queue');
var Playlists = require('./pages/Playlists');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var renderedPage;

    // render the current page
    // TODO: make it so that this.props.page determines
    //       page by string variable selection instead of switch
    switch (this.props.page) {
      case 'Me':
        renderedPage = Me(this.props);
        break;
      case 'Queue':
        renderedPage = Queue(this.props);
        break;
      case 'Playlists':
        renderedPage = Playlists(this.props);
        break;
      case 'Mixes':
        renderedPage = Mixes(this.props);
        break;
      case 'Search':
        renderedPage = Search(this.props);
        break;
      case 'TasteProfiles':
        renderedPage = TasteProfiles(this.props);
        break;
      default:
        debug("warning, unknown page: " + this.props.page);
    }

    return (
      <main>
        {renderedPage}
      </main>
    );
  },

  componentDidMount: function () {
    var playlists = this.getCollection().playlists;
    playlists.add({});
    playlists.add({ 'name': 'Caio\'s Stuff' });
    playlists.add({ 'name': 'pole songs' });

/*
    var tasteProfiles = this.getCollection().tasteProfiles;
    console.log("FETCHING TasteProfiles", tasteProfiles);
    tasteProfiles.fetch({
      'success': function(collection, response, options) {
        console.log("SUCCESS", collection, response, options);
      },
      'error': function(collection, response, options) {
        console.log("ERROR", collection, response, options);
      },
    });
  */
  },

});