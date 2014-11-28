/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/Uploader/dropzone')

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function() {
    return {
      'dragOverClass': '',
    };
  },

  onDragOver: function(e) {
    e.preventDefault();
  },

  onDragLeave: function(e) {
    console.log("dragleave")
    this.setState({'dragOverClass': ''});
  },

  onDragEnter: function(e) {
    console.log("dragenter");
    this.setState({'dragOverClass': 'dragover'});
    e.preventDefault();
  },

  onDrop: function(e) {
    e.preventDefault();
    console.log("drop");
    // Load the file into wavesurfer
    if (e.dataTransfer.files.length) {
      this.props.onDrop(e.dataTransfer.files);
    } else {
      console.log('error', 'Not a file');
    }
  },

  render: function() {
    return (
      <div
        className={this.dragOverClass}
        onDragEnter={this.onDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
      >
        Drag and drop transition
      </div>
    )
  }
});
