/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('../models/Me');

var Tracks = require('../collections/Tracks');

var Header = require('./Header');
var Main = require('./Main');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      model: {
        me: new Me(),
      },
      collection: {
        tracks: new Tracks(),
      },
    };
  },

  render: function () {

    return (
      <div>
        {Header(this.props)}
        {Main(this.props)}
      </div>
    );
  },
});