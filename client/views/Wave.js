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

  // rendered component has been mounted to a DOM element
  componentDidMount: function () {

    // initialize a wavesurfer object
    var wavesurfer = Object.create(WaveSurfer);
    wavesurfer.init({
      container: this.$('#wave').get(0),
      waveColor: 'violet',
      progressColor: 'purple',
    });

    // load the track stream
    wavesurfer.load(
      // use a CORS-proxy URL
      "http://localhost:5001/" + this.props.track.stream_url.replace(/^https:\/\//, '') + "?client_id=" + clientId
    );

    // store this wavesurfer instance
    this.wavesurfer = wavesurfer;
  },

  // component will be unmounted from the DOM
  componentWillUnmount: function () {

    // clean up the wavesurfer
    this.wavesurfer.destroy();
    delete this.wavesurfer;
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