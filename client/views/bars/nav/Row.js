/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

// TODO: separate draggable into its own view with params for html

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'active': false,
      'draggable': false,
      'dragClass': 'dragging',
      'activeClass': 'positive',
      'inactiveClass': '',
      'dragOverClass': '',
      'mouseOverClass': 'active mouse-over',
      'onMouseEnter': function () {}, // no-op
      'onMouseLeave': function () {}, // no-op
      'onDragStart': function () {}, // no-op
      'onDragEnd': function () {}, // no-op
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
    this.props.onMouseEnter();
  },

  onMouseLeave: function (e) {
    this.setState({
      'mouseOver': false,
    });
    this.props.onMouseLeave();
  },

  onDragStart: function (e) {
    this.setState({
      'dragging': true,
    });
    e.dataTransfer.effectAllowed = 'move';
    // turn object into json and set as data
    e.dataTransfer.setData('application/json', JSON.stringify(this.props));
    this.props.onDragStart(e);
  },

  onDragOver: function (e) {
    // make sure to prevent default drop event
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.props.onDragOver(e);
    return false;
  },

  onDragEnd: function (e) {
    this.setState({
      'dragging': false,
    });
    this.props.onDragEnd(e);
  },

  onDragEnter: function (e) {
    e.preventDefault();
    this.setState({
      'dragOver': true,
    });
    this.props.onDragEnter(e);
  },

  onDragLeave: function (e) {
    this.setState({
      'dragOver': false,
    });
    this.props.onDragLeave(e);
  },

  onDrop: function (e) {
    this.setState({
      'dragOver': false,
    });
    this.props.onDrop(e);
  },

  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick(this.props, e);
  },

  handleDblClick: function(e) {
    e.preventDefault();
    this.props.handleDblClick(this.props, e);
  },

  // TODO: make it so cells can be clicked/active
  render: function () {
    // generate info from data
    var data = (this.props.data && this.props.data.map(function (datum) {
      return (<td>{datum}</td>)
    }));
    // check if row active
    var className = this.props.active ?
      this.props.activeClass : this.props.inactiveClass;
    // check if being moused over
    className += ' ' + (this.state.mouseOver ? this.props.mouseOverClass : '');
    // check if being dragged
    className += ' ' + (this.state.dragging ? this.props.dragClass : '');
    // check if being dragged over
    className += ' ' + (this.state.dragOver ? this.props.dragOverClass : '');
    return (
      <tr
        className={className}
        onClick={this.handleClick}
        draggable={this.props.draggable}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
        onDragOver={this.onDragOver}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onDoubleClick={this.handleDblClick}>
        {data}
      </tr>
    );
  },

});