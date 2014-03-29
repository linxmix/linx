/** @jsx React.DOM */
var debug = require('debug')('views:Main')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('./pages/Me');
var Library = require('./pages/Library');
var UpNext = require('./pages/UpNext');
var Playlists = require('./pages/Playlists');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var renderedPage;

    // render the current page
    // TODO: make it so that this.props.page determines the require?
    switch (this.props.page) {
      case 'me':
        renderedPage = Me(this.props);
        break;
      case 'library':
        renderedPage = Library(this.props);
        break;
      case 'upNext':
        renderedPage = UpNext(this.props);
        break;
      case 'playlists':
        renderedPage = Playlists(this.props);
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
});