// Augment Graviton Model
Graviton.Model.prototype.isDirty = function() {
  return this.isNew() || this._pendingMods.length;
};

Graviton.Model.prototype.isNew = function() {
  return this.get('isNew') !== false;
};

Graviton.Model.prototype.store = function() {
  return this.saveAttrs('isNew', false);
};

Graviton.Model.prototype.refresh = function() {
  this._id && this.cloneFrom(this._collection.findOne(this._id));
};

Graviton.Model.prototype.cloneFrom = function(model) {
  _.extend(this, model);
};

// set and save
Graviton.Model.prototype.saveAttrs = function() {
  this.set.apply(this, arguments);
  return this.save();
};

// make get reactive
var prevGetFn = Graviton.Model.prototype.get;
Graviton.Model.prototype.get = function() {
  this.refresh();
  return prevGetFn.apply(this, arguments);
};

// augment _setProperty to skip updates with no change
var prevSetPropertyFn = Graviton.Model.prototype._setProperty;
Graviton.Model.prototype._setProperty = function(key, val) {
  // do not update if no change
  if (Graviton.getProperty(this.attributes, key) === val) {
    return val;
  } else {
    return prevSetPropertyFn.apply(this, arguments);
  }
};
