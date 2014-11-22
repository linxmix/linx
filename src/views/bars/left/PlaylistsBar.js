/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/PlaylistBar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Playlists = require('../../playlist/Playlists');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleClick: function (playlist) {
    this.props.setViewingPlaylist(playlist);
  },

  save: function (e) {
    // TODO: make this check more concrete
    if (!this.props.me.id) {
      alert("Sorry, but you can't save your playlists unless you're signed in!");
    } else {
      if (window.confirm('Are you sure you want to sync to Soundcloud?')) {
        this.getCollection().playlists.save();
      }
    }
  },

  add: function (e) {
    var playlists = this.getCollection().playlists;
    playlists.add({});
  },

  remove: function (e) {
    var playlist = this.props.viewingPlaylist;
    // do not remove searchResults or favorites
    if (playlist &&
      (playlist.get('linxType') !== 'searchResults') && 
      (playlist.get('linxType') !== 'favorites')) {
      var name = playlist.get('name');
      // mark for delete
      playlist.set({ 'delete': true });
    }
  },

  render: function () {
    var className = "ui vertical inverted sidebar menu " +
      this.props.className;
    var options = {
      'playlistView': 'tab',
      'playState': this.props.playState,
      'viewingPlaylist': this.props.viewingPlaylist,
      'playingPlaylist': this.props.playingPlaylist,
      'handleClick': this.handleClick,
      'dragging': this.props.dragging,
      'wrapperClassName': 'playlists-tabs',
      'className': "ui table inverted secondary purple segment",
    };
    var colls = this.getCollection();
    return (
      <div className={className}>

        <div className="header item">
          Playlists
        </div>
        {Playlists(_.extend({
          'playlists': colls.playlists
        }, options))}

        <div className="header item">
          Mixes
        </div>
        {Playlists(_.extend({
          'playlists': colls.mixes
        }, options))}

        <div className="header item">
          <div className="small ui icon buttons">
            <div className="inverted purple ui icon button" onClick={this.add}>
              <i className="green add icon"></i>
            </div>
            <div className="inverted purple ui icon button" onClick={this.remove}>
              <i className="red remove icon"></i>
            </div>
          </div>
          <div className="small circular orange ui button" onClick={this.save}>
            Save
          </div>
        </div>
      </div>
    );
  },

});
