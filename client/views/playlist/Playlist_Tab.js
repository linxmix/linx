/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:playlist/Playlist_List');

var _ = require('underscore');

var Tab = require('../bars/nav/Tab');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'playing': false,
      'active': false,
    }
  },

  getInitialState: function () {
    return {
      'editing': false,
      'editedName': '',
    }
  },

  handleDblClick: function (playlist, e) {
    var playlist = this.props.playlist;
    if (playlist.get('type') === 'playlist') {
      this.setState({ 'editing': true, });
    }
  },

  handleChange: function (e) {
    var text = this.refs.editedName.getDOMNode().value;
    this.setState({ 'editedName': text, });
  },

  handleSubmit: function (e) {
    this.setState({ 'editing': false, });
    var playlist = this.props.playlist;
    playlist.set({ 'name': this.state.editedName, });
    // prevent page reload
    return false;
  },

  onDrop: function (e) {
    e.stopPropagation();
    // recover object from json
    var obj = JSON.parse(e.nativeEvent.dataTransfer.getData('application/json'));
    // if object is a track, add it to this playlist
    var model = obj.backboneModel;
    if (model && model.kind === 'track') {
      console.log(this.props.playlist);
      this.props.playlist.add(model)
    }
    // if object is a playlist, add that playlist to this
    // TODO: make playlists draggable?
  },

  render: function () {
    var playlist = this.props.playlist;

    // TODO: modularize edit field, convert to semantic input/form
    // change view if editing
    var editing = this.state.editing;
    if (editing) {
      var edit = (
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={this.state.editedName}
            ref="editedName"
            onChange={this.handleChange}>
          </input>
        </form>
      )
    }

    var name = !this.props.playing ? playlist.get('name') :
      (<div>{playlist.get('name')}<i className="play icon"></i></div>);
    return Tab(_.extend({}, playlist, {
      'active': this.props.active,
      'name': (editing) ? edit : name,
      'dragOverClass': 'drag-over',
      'onDrop': this.onDrop,
      'activeClass': 'active item',
      'inactiveClass': 'item',
      'handleClick': this.props.handleClick,
      'handleDblClick': this.handleDblClick,
    }));
  },

  // if edit is present, focus it
  componentDidUpdate: function () {
    if (this.state.editing) {
      this.refs.editedName.getDOMNode().focus();
    }
  },

  // make inital edit name the playlist's original name
  componentDidMount: function () {
    this.setState({ 'editedName': this.props.playlist.get('name'), });
  },

});