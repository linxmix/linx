/** @jsx React.DOM */
var debug = require('debug')('views:Main')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('./pages/Me');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var renderedPage;

    // render the current page
    switch (this.props.page) {
      case 'me':
        renderedPage = Me(this.props);
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