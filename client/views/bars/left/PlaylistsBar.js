/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/PlaylistBar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Playlists = require('../../playlist/Playlists');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleClick: function (playlist) {
    this.props.setActivePlaylist(playlist);
  },

  generate: function (e) {
    debug("generate", this.props);
    var playlists = this.getCollection().playlists;
  },

  add: function (e) {
    debug("add", this.props);
    var playlists = this.getCollection().playlists;
    playlists.add({});
  },

  remove: function (e) {
    debug("remove", this.props);
    var playlist = this.props.activePlaylist;
    // do not remove the queue
    if (playlist && (playlist.get('type') !== 'queue')) {
      var playlists = this.getCollection().playlists;
      playlists.remove(playlist);
    }
  },

  render: function () {
    var className = "ui vertical inverted sidebar menu " +
      this.props.className;
    return (
        <div className={className}>
          <div className="header item">Playlists</div>
          {Playlists({
            'playlistView': 'tab',
            'activePlaylist': this.props.activePlaylist,
            'playlists': this.getCollection().playlists,
            'handleClick': this.handleClick,
            'className': "ui table inverted secondary purple segment",
          })}
          <div className="header item">
            <div className="small ui icon buttons">
              <div className="inverted purple ui icon button" onClick={this.add}>
                <i className="green add icon"></i>
              </div>
              <div className="inverted purple ui icon button" onClick={this.remove}>
                <i className="red remove icon"></i>
              </div>
            </div>
            <div className="small circular orange ui button" onClick={this.generate}>
              Generate
            </div>
          </div>
        </div>
    );
  },

});