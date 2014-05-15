/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/PinBar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    return (
      <div className="ui inverted segment">
      </div>
    );
  },

});
/*
      <div>
        <button className="sidebar toggle">toggle sidebar</button>
        <div className="ui red vertical demo sidebar menu">
          <a className="item">
            <i className="home icon"></i>
            Home
          </a>
          <a className="active item">
            <i className="heart icon"></i>
            Current Section
          </a>
          <a className="item">
            <i className="facebook icon"></i>
            Like us on Facebook
          </a>
          <div className="item">
            <b>More</b>
            <div className="menu">
              <a className="item">About</a>
              <a className="item">Contact Us</a>
            </div>
          </div>
        </div>
      </div>

  componentDidMount: function () {
    this.$('.sidebar.toggle').unbind('click');
    this.$('.sidebar.toggle').click(function () {
      this.$('.ui.sidebar').sidebar('toggle');
    }.bind(this));
  },
*/
