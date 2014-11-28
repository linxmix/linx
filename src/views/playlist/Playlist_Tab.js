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
      'isPlayingPlaylist': false,
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
    var type = playlist.get('linxType')
    if ((type === 'playlist') || (type === 'mix')) {
      this.setState({ 'editing': true, });
    }
  },

  handleClick: function(tab, e) {
    var playlist = this.props.playlist;
    this.props.handleClick(playlist);
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

  // TODO: what is thing?
  onDrop: function (thing) {
    var dragging = this.props.dragging;
    var playlist = this.props.playlist;
    debug("onDrop", thing, dragging);
    playlist.add(dragging);
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
    var name = playlist.get('name');
    if (this.props.isPlayingPlaylist) {
      if (this.props.playState === 'play') {
        name = (<div className="ignore-mouse"><i className="volume up icon"></i>{name}</div>);
      } else {
        name = (<div className="ignore-mouse"><i className="volume off icon"></i>{name}</div>);
      }
    }
    return Tab(_.extend({}, playlist, {
      'active': this.props.active,
      'name': (editing) ? edit : name,
      'dragOverClass': 'drag-over',
      'onDrop': this.onDrop,
      'activeClass': 'active item',
      'inactiveClass': 'item',
      'handleClick': this.handleClick,
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
