/** @jsx React.DOM */
var debug = require('debug')('views:Main')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('./pages/Me');
var Search = require('./pages/Search');
var Queue = require('./pages/Queue');
var Uploader = require('./pages/Uploader');
var Playlist = require('./pages/Playlist');

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
      case 'Uploader':
        renderedPage = Uploader(this.props);
        break;
      //case 'Queue':
      //  renderedPage = Queue(this.props);
      //  break;
      case 'Playlist': case 'Queue':
        renderedPage = Playlist(this.props);
        break;
      case 'Search':
        renderedPage = Search(this.props);
        break;
      default:
        debug("warning, unknown page: " + this.props.page);
    }

    return (
      <main className="main-container">
        {renderedPage}
      </main>
    );
  },

  componentDidMount: function () {

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