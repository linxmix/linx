/** @jsx React.DOM */
var debug = require('debug')('views:Welcome')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Connect = require('./pages/Connect');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  warnEntrance: function () {
    alert("Just so you know, we can't save your playlists when you're not logged in...\nHappy exploring!");
    this.enterSite();
    return false;
  },

  enterSite: function () {
    this.props.changePage("Site");
  },

  render: function () {
    return (
      <div className="welcome-page">
        <div className="welcome-block">
          <div className="welcome-header">
            <div className="massive inverted ui message">
              Welcome to Linx!
            </div>
          </div>
          <div className="welcome-text">
            <div>
              {Connect({
                'myTracks': this.props.myTracks,
                'onLogin': this.enterSite,
                'showDisconnect': false,
              })}
            </div>
            <p>-OR-</p>
            <a onClick={this.warnEntrance} href="">
              Skip This Step
            </a>
          </div>
        </div>
      </div>
    );
    
  },

});