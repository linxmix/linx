/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Connect = require('./Connect');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    return (
      <div className="ui menu" role="navigation">
        <button className="active item" onClick={this.test}>Linx</button>
        <button onClick={this.test}>Playlist</button>
        <button onClick={this.test}>UpNext</button>
        <button onClick={this.test}>Map</button>
        <Connect me={this.props.me} />
      </div>
    );
  },

  test: function () {
    console.log("hi! test click");
  }

});