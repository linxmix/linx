/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var WaveSurfer = require('wavesurfer');

var clientId = require('../config').clientId;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    return (
      <div>
        <div id="wave"></div>
        <button onClick={this.play}>play</button>
        <button onClick={this.pause}>pause</button>
        <button onClick={this.stop}>stop</button>
      </div>
    );
  },

  componentDidMount: function () {
    console.log(this.props.track.id, this.$('#wave').get(0), this.props.track.uri);
    var wavesurfer = Object.create(WaveSurfer);
    wavesurfer.init({
      container: this.$('#wave').get(0),
      waveColor: 'violet',
      progressColor: 'purple',
    });
    wavesurfer.load(
      "http://localhost:5001/" + this.props.track.stream_url.replace(/^https:\/\//, '') + "?client_id=" + clientId
    );
    this.wavesurfer = wavesurfer;
  },

  play: function () {
    this.wavesurfer.play();
  },

  pause: function () {
    this.wavesurfer.pause();
  },

  stop: function () {
    this.wavesurfer.stop();
  },

});