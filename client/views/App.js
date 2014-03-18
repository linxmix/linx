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

  getInitialState: function () {
    return {
      page: 'upNext',
    }
  },

  changePage: function(newPage) {
    console.log("changePage", newPage)
    this.setState({
      page: newPage,
    });
  },

  render: function () {
    // TODO: instead of Main, have different pages
    return (
      <div>
        <Header
          me={this.props.me}
          tracks={this.props.tracks}
          page={this.state.page}
          changePage={this.changePage}
        />

        <Main 
          me={this.props.me}
          tracks={this.props.tracks}
          page={this.state.page}
          changePage={this.changePage}
        />

      </div>
    );
  },
});