/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:pages/PlaylistSidebar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

/* DOES NOT WORK
$ = require('jquery');
$.fn.sidebar = require('semantic-ui/modules/sidebar');
*/

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    console.log("RENDERING SIDEBAR", sidebar);
    return (
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
    );

  },

  componentDidMount: function () {
    console.log("SIDEBAR MOUNTED", this.$('.demo.sidebar'));
    this.$('.demo.sidebar').sidebar('toggle');
  },

});