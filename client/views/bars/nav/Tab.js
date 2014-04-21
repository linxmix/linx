/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'active': false,
      'draggable': false,
      'dragClass': 'dragging',
      'dragOverClass': '',
      'onDragOver': function () {}, // no-op
      'onDragEnter': function () {}, // no-op
      'onDragLeave': function () {}, // no-op
      'onDrop': function () {}, // no-op
      'handleClick': function () {}, // no-op
      'handleDblClick': function () {}, // no-op
    }
  },

  getInitialState: function () {
    return {
      'dragging': false,
      'dragOver': false,
    }
  },

  onDragOver: function (e) {
    // make sure to prevent default drop event
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.props.onDragOver(this.props, e);
    return false;
  },

  onDragEnter: function (e) {
    e.preventDefault();
    this.setState({
      'dragOver': true,
    });
    this.props.onDragEnter(this.props, e);
  },

  onDragLeave: function (e) {
    this.setState({
      'dragOver': false,
    });
    this.props.onDragLeave(this.props, e);
  },

  onDrop: function (e) {
    this.setState({
      'dragOver': false,
    });
    this.props.onDrop(this.props, e);
  },

  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick(this.props, e);
  },

  handleDblClick: function(e) {
    e.preventDefault();
    this.props.handleDblClick(this.props, e);
  },

  render: function () {
    // check if tab active
    var className = this.props.active ?
      this.props.activeClass : this.props.inactiveClass;
    // check if being dragged over
    className += ' ' + (this.state.dragOver ? this.props.dragOverClass : '');
    return (
      <a
        className={className}
        onClick={this.handleClick}
        onDoubleClick={this.handleDblClick}
        onDragOver={this.onDragOver}
        onDrop={this.onDrop}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}>
        {this.props.name}
      </a>
    );
  },

});