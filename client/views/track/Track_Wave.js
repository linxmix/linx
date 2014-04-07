/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:track/Track_Wave');
var Backbone = require('backbone');

var ReactBackboneMixin = require('backbone-react-component').mixin;

var WaveSurfer = require('wavesurfer.js');

  // TODO: make able to queue song more than once?
  // TODO: make it so only one widget can be playing at any given time.
  // TODO: import all my functions from old linx project

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'active': true,
    }
  },

  render: function () {
    var track = this.props.track;
    //debug("render track_wave", track);
    // only display if active
    var className = (this.props.active) ? "" : "hidden";
    return (
      <div className={className}>
        <p>{track && track.get('title')}</p>
        <div className="wave">
          <div className="ui active teal progress">
            <div className="bar"></div>
          </div>
        </div>
        <button onClick={this.play}>play</button>
        <button onClick={this.pause}>pause</button>
        <button onClick={this.stop}>stop</button>
      </div>
    );
  },

  // rendered component has updated
  componentDidUpdate: function () {
    //this.widget.redraw();
    //debug('component updated');
    // bind this wavesurfer to the new DOM, then redraw
    //var wavesurfer = this.wavesurfer;
    //console.log(this.$('.wave'));
    //wavesurfer.params.container = this.$('.wave').get(0);
    //if (wavesurfer.backend.buffer) {
    //  wavesurfer.createDrawer();
    //}
  },

  // rendered component has been mounted to a DOM element
  componentDidMount: function () {

    // create and save wavesurfer object
    var wavesurfer = this.wavesurfer = Object.create(WaveSurfer);

    // setup progress bar
    var progressDiv = this.$('.progress');
    var progressBar = progressDiv.children('.bar');

    var showProgress = function (percent) {
      progressDiv.css('display', 'block');
      progressBar.css('width', percent + '%');
    };
    var hideProgress = function () {
      progressDiv.css('display', 'none');
    };
    wavesurfer.on('loading', showProgress);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('error', hideProgress);

    // initialize
    wavesurfer.init({
      container: this.$('.wave').get(0),
      waveColor: 'violet',
      progressColor: 'purple',
    });

    // add wavesurfer to collection
    var widgets = this.widgets = this.getCollection().widgets;
    var widget = this.widget = widgets.add({
      'soundBarId': this.props.soundBarId,
      'index': this.props.index,
      'widget': wavesurfer,
    });

    // if track given, load the track stream
    if (this.props.track) {
      widget.load(this.props.track);
    }

    // if this is a widget wave, bind to finish event
    if (typeof this.props.soundBarId !== 'undefined') {
      wavesurfer.on('finish', function() {
        debug("widget event: FINISH", wavesurfer);
        // update activeWidget
        var nextWidget = (this.props.index + 1) % widgets.length;
        this.props.setActiveWidget(nextWidget);
        // cycle queue
        this.getCollection().queue.shift();
      }.bind(this));
    }

  },

  // component will be unmounted from the DOM
  componentWillUnmount: function () {
    debug("componentWillUnmount");

    // delete model
    this.widgets.remove(this.widget);

    // clean up the wavesurfer
    this.wavesurfer.destroy();
    delete this.wavesurfer;
  },

  play: function () {
    this.widget.play();
    this.props.changePlayState('play');
  },

  pause: function () {
    this.widget.pause();
    this.props.changePlayState('pause');
  },

  stop: function () {
    this.props.changePlayState('stop');
    this.widget.stop();
  },

});