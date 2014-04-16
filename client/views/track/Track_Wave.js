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
      'playing': false,
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

  setWidgetPlayState: function () {
    var widget = this.props.widget;
    if (this.props.playing) {
      widget.setPlayState(this.props.playState);
    }
  },

  updateWidget: function (prevWidget) {
    var widget = this.props.widget;
    // set widget to not loaded
    widget.set({ 'loaded': false });
    // make sure to remove player from previous widget
    prevWidget && prevWidget.unsetPlayer();
    // load track if given
    if (this.props.track) {
      widget.setTrack(this.props.track);
    }
    // if playing track starts or stops loading, tell parent
    // remove old handlers
    if (prevWidget && this.onLoadedChange) {
      prevWidget.off('change:loaded', this.onLoadedChange);
    }
    this.wave.un('finish');
    // make new handlers
    var onLoadedChange = this.onLoadedChange = function (widget, loaded) {
      debug("onLoadedCHANGE", widget.get('index'),
        this.props.playing, loaded)
      // TODO: fix this because playing changes
      if (this.props.playing) {
        if (loaded) {
          this.props.onLoadEnd();
        } else {
          this.props.onLoadStart();
        }
      }
    }.bind(this);
    // add new handlers
    widget.on('change:loaded', onLoadedChange);
    this.wave.on('finish', this.props.onFinish);
    // add wavesurfer to widget
    widget.setPlayer(this.wave);
    this.setWidgetPlayState();
  },

  // rendered component has updated
  componentDidUpdate: function (prevProps, prevState) {
    this.setWidgetPlayState();

    // if widget changed, load new stuff into it
    var prevWidget = prevProps.widget;
    if (this.props.widget.cid !== prevWidget.cid) {
      this.updateWidget(prevWidget);
    }

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
    var wave = this.wave = Object.create(WaveSurfer);

    // 
    // 
    //
    wave.fireEvent = function (event) {
      if (!this.handlers) { return; }

      var handlers = this.handlers[event];
      var args = Array.prototype.slice.call(arguments, 1);
      if (handlers) {
        for (var i = 0, len = handlers.length; i < len; i += 1) {
          if (handlers[i]) { // ADDED THIS CHECK for concurrency
            handlers[i].apply(null, args);
          }
        }
      }
    }
    // 
    // 
    // 

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
    wave.on('loading', showProgress);
    wave.on('ready', hideProgress);
    wave.on('destroy', hideProgress);
    wave.on('error', hideProgress);

    // initialize
    wave.init({
      container: this.$('.wave').get(0),
      waveColor: 'violet',
      progressColor: 'purple',
    });
    this.updateWidget();

  },

  // component will be unmounted from the DOM
  componentWillUnmount: function () {
    debug("componentWillUnmount");

    // remove wavesurfer from widget
    this.props.widget.unsetPlayer();

    // clean up the wavesurfer
    this.wave.destroy();
    delete this.wave;
  },

});