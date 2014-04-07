/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/PlaylistBar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('../nav/Tab');
var Playlists_Table = require('../../playlist/Playlists_Table');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {


    return (
      <div>
        {Playlists_Table({
          'activePlaylist': this.props.activePlaylist,
          'playlists': this.getCollection().playlists,
          'handleClick': function (row) {
            console.log("ROW CLICK", row);
            this.props.changeActivePlaylist(row.key);
          }.bind(this),
        })}
      </div>
    );
  },

});