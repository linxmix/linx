/** @jsx React.DOM */
var debug = require('debug')('views:Main')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('./pages/Me');
var Library = require('./pages/Library');
var UpNext = require('./pages/UpNext');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var renderedPage;

    // render the current page
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
      default:
        debug("new page: " + this.props.page);
    }

    return (
      <main>
        {renderedPage}
      </main>
    );
  },
});