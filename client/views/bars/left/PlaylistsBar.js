/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/PlaylistBar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('../nav/Tab');
var Playlists_Table = require('../../playlist/Playlists_Table');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleClick: function (playlist) {
    this.props.setActivePlaylist(playlist);
  },

  render: function () {
    var className = "ui vertical inverted sidebar menu " +
      this.props.className;
    return (
        <div className={className}>
          <div className="header item">Playlists</div>
          <a className="item ">
            {Playlists_Table({
              'activePlaylist': this.props.activePlaylist,
              'playlists': this.getCollection().playlists,
              'handleClick': this.handleClick,
              'className': "ui table inverted secondary purple segment",
            })}
          </a>
        </div>
    );
  },

});