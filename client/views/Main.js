/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    return (
      <main>
        {this.props.tracks}
      </main>
    );
  },
});