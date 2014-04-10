/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:track/Track_Wave');
var Backbone = require('backbone');

var ReactBackboneMixin = require('backbone-react-component').mixin;

var Track_List_SC = require('./Track_List_SC');

var WaveSurfer = require('wavesurfer.js');

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
        <div className="wave">
          <div className="ui active teal progress">
            <div className="bar"></div>
          </div>
        </div>
        {Track_List_SC({ 'track': track, })}
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
    var widget = this.props.widget;

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

    // load track if given
    if (this.props.track) {
      widget.setTrack(this.props.track);
    }

    // add wavesurfer to widget
    widget.setPlayer(wavesurfer);
  },

  // component will be unmounted from the DOM
  componentWillUnmount: function () {
    debug("componentWillUnmount");

    // remove wavesurfer from widget
    widget.unsetPlayer();

    // clean up the wavesurfer
    this.wavesurfer.destroy();
    delete this.wavesurfer;
  },

});
/*


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
  */