import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['page-drop'],
  classNameBindings: ['isDraggingOver:drag-over'],

  actions: {
    onDrop: function(files) {
      this.sendAction('action', files);
    }
  },

  // params
  _handlers: null,
  lastDragTarget: null,
  isDraggingOver: Ember.computed.bool('lastDragTarget'),

  onDragEnter: function(e) {
    this.set('lastDragTarget', e.target);
  },

  onDragOver: function(e) {
    if (e.target === this.get('lastDragTarget')) {
      e.preventDefault();
    }
  },

  onDragLeave: function(e) {
    if (e.target === this.get('lastDragTarget')) {
      e.preventDefault();
      this.set('lastDragTarget', null);
    }
  },

  onDrop: function(e) {
    if (e.target === this.get('lastDragTarget')) {
      e.preventDefault();
      this.set('lastDragTarget', null);
      if (e.dataTransfer && e.dataTransfer.files) {
        this.send('onDrop', e.dataTransfer.files);
      }
    }
  },

  initHandlers: function() {
    var handlers = {};

    handlers.dragenter = this.get('onDragEnter').bind(this);
    handlers.dragover = this.get('onDragOver').bind(this);
    handlers.dragleave = this.get('onDragLeave').bind(this);
    handlers.drop = this.get('onDrop').bind(this);

    Object.keys(handlers).forEach(function(key) {
      window.addEventListener(key, handlers[key]);
    });

    this.set('_handlers', handlers);
  }.on('init'),

  removeHandlers: function() {
    var handlers = this.get('_handlers');

    Object.keys(handlers).forEach(function(key) {
      window.removeEventListener(key, handlers[key]);
      delete handlers[key];
    });

    this.set('_handlers', {});
  }.on('destroy'),
});

