/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:track/Track_Wave');
var Backbone = require('backbone');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Track_List_SC = require('./Track_List_SC');
var Widget_Wave = require('../../models/Widget_Wave');

var _ = require('underscore');
var WaveSurfer = require('wavesurfer.js');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'listener': _.extend({}, Backbone.Events),
      'active': true,
      'playing': false,
      'playState': 'stop',
      'widget': new Widget_Wave(),
      'dragSelection': false,
      'loopSelection': false,
      'pos': 0,
    }
  },

  onUpdateSelection: function (newSelection) {
    this.props.onUpdateSelection(this.props.track, newSelection);
  },

  // mark on hover
  onMouseMove: function (event) {
    this.props.widget.setHoverMark(event);
  },

  // delete hover mark when leaving
  onMouseLeave: function (event) {
    this.props.widget.clearHoverMark(event);
  },

  setWidgetPlayState: function () {
    var widget = this.props.widget;
    if (this.props.playing) {
      widget.setPlayState(this.props.playState);
    } else {
      widget.setPlayState('stop');
    }
  },

  render: function () {

    // TODO: make this smarter about when this happens
    this.props.widget.drawMatches();
    
    var track = this.props.track || this.props.widget.get('track');
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
        {track && Track_List_SC({ 'track': track, })}
      </div>
    );
  },

  listenTo: function (widget) {
    if (widget) {
      var listener = this.props.listener;
      var cb = function (widget, loading) {
        if (this.props.playing) {
          if (loading) {
            this.props.onLoadStart(widget);
          } else {
            this.props.onLoadEnd(widget);
          }
        }
      }.bind(this);
      listener.listenTo(widget, 'change:loading', cb);
      // load track if given
      if (this.props.track) {
        widget.setTrack(this.props.track);
      }
      // set new player
      widget.setPlayer(this.wave);
      this.setWidgetPlayState();
    }
  },

  stopListening: function (widget) {
    if (widget) {
      this.props.listener.stopListening(widget);
      widget.unsetPlayer()
    }
  },

  resetListener: function (prevWidget) {
    this.stopListening(prevWidget);
    this.listenTo(this.props.widget);
  },

  // rendered component has updated
  componentDidUpdate: function (prevProps, prevState) {

    // if widget changed, load new stuff into it
    var widget = this.props.widget;
    var prevWidget = prevProps.widget;
    if (widget.cid !== prevWidget.cid) {
      debug("NEW WIDGET");
      this.resetListener(prevWidget);
    } else {
      this.setWidgetPlayState();
    }

    // if changing to playing
    if (!(prevProps.playing) && this.props.playing) {
      // if loading, call onLoadStart
      if (this.props.widget.get('loading')) {
        this.props.onLoadStart();
      // if not loading, call onLoadEnd
      } else {
        this.props.onLoadEnd();
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

  // initialize this trackWave's wave object.
  componentDidMount: function () {

    // create and save wavesurfer object
    var wave = this.wave = Object.create(WaveSurfer);

    // 
    // hackery
    //
    wave.fireEvent = fireEventCustom;
    wave.pause = pauseCustom;
    wave.empty = emptyCustom;
    wave.updateSelection = updateSelectionCustom;
    wave.Mark.remove = removeCustom;
    // 
    // /end hackery
    // 

    // setup progress bar
    var progressDiv = this.$('.progress');
    var progressBar = progressDiv.children('.bar');

    var showProgress = function (percent, target) {
      progressDiv.css('display', 'block');
      progressBar.css('width', percent + '%');
    };
    var hideProgress = function () {
      progressDiv.css('display', 'none');
    };

    // initialize handlers
    wave.on('loading', showProgress);
    wave.on('empty', showProgress);
    wave.on('destroy', hideProgress);
    wave.on('error', function (err) {
      hideProgress();
      this.props.onLoadError(err, this.props.widget);
    }.bind(this));
    wave.on('endMark', function (endMark) {
      this.props.onFinish();
    }.bind(this));
    // ensure endMark is hit
    wave.on('finish', function () {
      var endMark = wave.markers['end']
      debug("FINISH", endMark)
      if (endMark && !endMark.played) {
        endMark.fireEvent('reached');
      }
    }.bind(this));
    wave.on('ready', function () {
      hideProgress();
      this.props.widget.onReady();
    }.bind(this));
    // TODO: will this.props.dragSelection ever change?
    if (this.props.dragSelection) {
      wave.on('updateSelection', this.onUpdateSelection);
    }


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
    this.resetListener()
    //
    // /end init
    //
  },

  componentWillUnmount: function () {

    // disconnect from widget
    this.stopListening(this.props.widget);

    // clean up the wavesurfer
    this.wave.destroy();
    delete this.wave;
  },

});

//
// custom functions to override wavesurfer defaults
//
function emptyCustom() {
  // ADDED TRY
  try {
    if (this.backend && !this.backend.isPaused()) {
      this.stop();
      this.backend.disconnectSource();
    }
    this.drawer.setWidth(0);
    this.drawer.drawPeaks({ length: this.drawer.getWidth() }, 0);
    this.clearMarks();
  }
  catch (e) { }
}
function removeCustom() {
  // SWITCHED ORDER
  this.fireEvent('remove');
  this.unAll();
}

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

function pauseCustom() {
  (!this.backend.isPaused()) && this.backend.pause();
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