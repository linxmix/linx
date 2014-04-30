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
      'pos': 0,
    }
  },

  onUpdateSelection: function (newSelection) {
    this.props.onUpdateSelection(this.props.track, newSelection);
  },

  doFade: function () {
    debug("DOING FADE", this.props);
    this.$('wave').transition({
      'allowRepeats': false,
    });
  },

  // TODO: move wave stuff into widget
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

  // TODO: move wave stuff into widget
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

  newWidget: function (prevWidget) {
    var widget = this.props.widget;

    // remove from prevWidget
    if (prevWidget && this.onLoadingChange) {
      prevWidget.off('change:loading', this.onLoadingChange);
    }
    prevWidget && prevWidget.unsetPlayer();
    prevWidget && (prevWidget.echoNest = undefined);

    // make handler
    var onLoadingChange = this.onLoadingChange || function (widget, loading) {
      debug("onLoadingChange", widget.get('index'),
        this.props.playing, widget.get('playState'), loading)
      // TODO: fix this
      if (this.props.playing) {
        if (loading) {
          this.props.onLoadStart();
        } else {
          this.props.onLoadEnd();
        }
      }
    }.bind(this);

    // add to new widget
    widget.on('change:loading', onLoadingChange);
    widget.setPlayer(this.wave);
    // TODO: only give this if this track_wave is in soundbar?
    widget.set({ 'echoNest': this.getCollection().echoNest });
    // load track if given
    if (this.props.track) {
      widget.setTrack(this.props.track);
    } else {
      widget.analyze();
    }
    this.setWidgetPlayState();
  },

  // rendered component has updated
  componentDidUpdate: function (prevProps, prevState) {

    // if widget changed, load new stuff into it
    var widget = this.props.widget;
    var prevWidget = prevProps.widget;
    if (widget && (widget.cid !== prevWidget.cid)) {
      debug("NEW WIDGET");
      this.newWidget(prevWidget);
    } else {
      this.setWidgetPlayState();
    }

    // if changing to playing, and loading, call onLoadStart
    if ((!(prevProps.playing) && this.props.playing) &&
      this.props.widget.get('loading')) {
      this.props.onLoadStart();
    }

/*
    // if we were showing and are now hiding, fade
    if (prevProps.active && !this.props.active) {
      this.doFade();
    }

    // if we were hiding and are now showing, fade
    if (!prevProps.active && this.props.active) {
      this.doFade();
    }
*/

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

    // initialize handlers
    wave.on('loading', showProgress);
    wave.on('empty', showProgress);
    wave.on('destroy', hideProgress);
    wave.on('error', hideProgress);
    wave.on('finish', function () {
      this.props.onFinish();
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
    this.newWidget()
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