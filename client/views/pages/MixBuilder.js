/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/MixBuilder')

var _ = require('underscore');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    return (
      <div>
        TODO: Build the Mix Builder
      </div>
    );
  },

});
