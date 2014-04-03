/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Search');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var config = require('../../config');
var echojs = require('echojs');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    return (
      <div>
        SearchBar TODO
      </div>
    );
  },

});