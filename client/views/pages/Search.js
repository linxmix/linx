/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Search');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    return (
      <div className="ui grid">
        <div className="sixteen wide column">
        TODO
        </div>
      </div>
    );
  },

});