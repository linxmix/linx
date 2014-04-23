/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:track/Track_Wave');
var Backbone = require('backbone');

var ReactBackboneMixin = require('backbone-react-component').mixin;

var Track_List_SC = require('./Track_List_SC');
var Widget_Wave = require('../../models/Widget_Wave');

var WaveSurfer = require('wavesurfer.js');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'active': true,
      'playing': false,
      'playState': 'stop',
      'widget': new Widget_Wave(),
      'dragSelection': false,
      'loopSelection': false,
    }
  },

  getInitialState: function () {
    return {
      'beatgrid': false,
      'matches': false,
    }
  },

  onUpdateSelection: function (newSelection) {
    this.props.onUpdateSelection(this.props.track, newSelection);
  },

  // cursor on hover
  onMouseMove: function (event) {
    // only do this if we have a file buffer loaded
    var wave = this.wave;
    if (wave.backend && wave.backend.buffer) {
      var e = event.nativeEvent;
      // extract mouse position from event
      var relX = 'offsetX' in e ? e.offsetX : e.layerX;
      var position = (relX / wave.drawer.scrollWidth) || 0;
      // scale percent to duration
      position *= wave.timings()[1];
      // mark hover position
      this.hoverMark = wave.mark({
        'id': 'hover',
        'position': position,
        'color': 'rgba(255, 255, 255, 0.8)',
      });
    }
  },

  // if we have a wave and a hoverMark, delete the hoverMark
  onMouseLeave: function (event) {
    var wave = this.wave;
    if (wave.backend && wave.backend.buffer) {
      if (this.hoverMark) {
        this.hoverMark.remove();
        delete this.hoverMark;
      }
    }
  },

  render: function () {
    var track = this.props.track;
    // only display if active
    var className = (this.props.active) ? "" : "hidden";
    return (
      <div className={className}>
        <div className="wave"
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}>
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

    //
    // prevWidget
    //
    // make sure to remove player from previous widget
    prevWidget && prevWidget.unsetPlayer();
    // if playing track starts or stops loading, tell parent
    // remove old handlers
    if (prevWidget && this.onLoadedChange) {
      prevWidget.off('change:loaded', this.onLoadedChange);
    }
    this.wave.un('finish');
    this.wave.un('updateSelection');
    //
    // /end prevWidget
    //

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
    if (this.props.dragSelection) {
      this.wave.on('updateSelection',
        this.onUpdateSelection);
    }
    // add wavesurfer to widget
    widget.setPlayer(this.wave);
    // load track if given
    if (this.props.track) {
      widget.setTrack(this.props.track);
    }
    // update widget play state
    this.setWidgetPlayState();
  },

  // rendered component has updated
  componentDidUpdate: function (prevProps, prevState) {
    this.setWidgetPlayState();

    // if widget changed, load new stuff into it
    var widget = this.props.widget;
    var prevWidget = prevProps.widget;
    if (widget && (widget.cid !== prevWidget.cid)) {
      this.updateWidget(prevWidget);
    }

    // if analysis is present and no beatgrid is set, set beatgrid
    var track = this.props.track;
    var analysis = track && track.get('echoAnalysis');
    if (!this.state.beatgrid) {
      if (this.props.beatgrid && analysis) {
        debug("adding beatgrid");
        var thresh = 0.5;
        analysis['beats'].forEach(function (beat) {
          if (beat['confidence'] >= thresh) {
            widget.addBeatMark(beat['start']);
          }
        }.bind(this));
        this.setState({ 'beatgrid': true });
      }
    }

    // set matches
    var track = this.props.track;
    var matches = track && track.get('matches');
    if (!this.state.matches) {
      if (matches) {
        debug("adding matches");
        matches.forEach(function (match) {
          widget.addMatchMark(match);
        }.bind(this));
        this.setState({ 'matches': true });
      }
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
    // hackery
    //
    wave.fireEvent = fireEventCustom;
    wave.updateSelection = updateSelectionCustom;
    // 
    // /end hackery
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

    //
    // init
    //
    wave.init({
      'container': this.$('.wave').get(0),
      'waveColor': 'steelblue',
      'progressColor': 'darkblue',
      'dragSelection': this.props.dragSelection,
      'loopSelection': this.props.loopSelection,
    });
    this.updateWidget()
    //
    // /end init
    //
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

//
// custom functions to override wavesurfer defaults
//
function fireEventCustom(event) {
  if (!this.handlers) { return; }

  var handlers = this.handlers[event];
  var args = Array.prototype.slice.call(arguments, 1);
  if (handlers) {
    for (var i = 0, len = handlers.length; i < len; i += 1) {
      // ADDED CHECK for concurrency and null functions not to error
      if (handlers[i]) {
        handlers[i].apply(null, args);
      }
    }
  }
}

function updateSelectionCustom(selection) {
  var my = this;

  var percent0 = selection.startPercentage;
  var percent1 = selection.endPercentage;
  var color = this.params.selectionColor;

  if (percent0 > percent1) {
    var tmpPercent = percent0;
    percent0 = percent1;
    percent1 = tmpPercent;
  }

  if (this.selMark0) {
    this.selMark0.update({ percentage: percent0 });
  } else {
    this.selMark0 = this.mark({
      width: 0,
      percentage: percent0,
      color: color
    });
  }

  if (this.selMark1) {
    this.selMark1.update({ percentage: percent1 });
  } else {
    this.selMark1 = this.mark({
      width: 0,
      percentage: percent1,
      color: color
    });
  }

  // ADDED NEW EVENT on update selection
  this.fireEvent('updateSelection', this.getSelection());

  this.drawer.updateSelection(percent0, percent1);

  if (this.loopSelection) {
    this.backend.updateSelection(percent0, percent1);
  }
}