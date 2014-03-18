/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Connect = require('./Connect');
var NavTab = require('./NavTab');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function() {
    return {
      navTabs: [
        {key: 'me', name: 'Me'},
        {key: 'playlists', name: 'Playlists'},
        {key: 'upNext', name: "Up Next"},
        {key: 'linxMap', name: "Linx Map"},
      ]
    };
  },

  render: function () {

    // make navTabs
    var navTabs = this.props.navTabs.map(function(navTab) {
      return (
        NavTab({
          'active': (navTab.key === this.props.page),
          'key': navTab.key,
          'name': navTab.name,
          'changePage': this.props.changePage,
        })
      )
    }.bind(this));

    // render navBar
    return (
      <div className="ui menu inverted" role="navigation">
        <div className="header item">Linx</div>
        {navTabs}
        <div className="item">
          <Connect me={this.props.me} />
        </div>
      </div>
    );
  },

});