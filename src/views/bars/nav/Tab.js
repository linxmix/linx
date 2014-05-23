/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'name': '',
      'type': 'a',
      'active': false,
      'draggable': false,
      'dragClass': 'dragging',
      'dragOverClass': '',
      'mouseOverClass': '',
      'onMouseEnter': function () {}, // no-op
      'onMouseLeave': function () {}, // no-op
      'onDragOver': function () {}, // no-op
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
      'mouseOver': false,
    }
  },

  onMouseEnter: function (e) {
    this.setState({
      'mouseOver': true,
    });
    this.props.onMouseEnter(e, this.props);
  },

  onMouseLeave: function (e) {
    this.setState({
      'mouseOver': false,
    });
    this.props.onMouseLeave(e, this.props);
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
    var props = {
      'className': className,
      'onClick': this.handleClick,
      'onDoubleClick': this.handleDblClick,
      'onMouseEnter': this.onMouseEnter,
      'onMouseLeave': this.onMouseLeave,
      'onDragOver': this.onDragOver,
      'onDrop': this.onDrop,
      'onDragEnter': this.onDragEnter,
      'onDragLeave': this.onDragLeave,
    };
    // render element based on tag type
    var rendered = React.DOM[this.props.type]
      (props, this.props.name);
    return rendered;
  },

});