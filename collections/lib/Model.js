// Augment Graviton Model
Graviton.Model.prototype.isDirty = function() {
  var updatedAt = this.getUpdatedAt().get();
  return this._pendingMods.length !== 0;
};

Graviton.Model.prototype.refresh = function() {
  var dbModel = this._collection.findOne(this.get('_id'));
  this.set(dbModel.attributes);
};

Graviton.Model.prototype.cloneFrom = function(model) {
  this.set(model.attributes);
};

Graviton.Model.prototype.getUpdatedAt = function() {
  var updatedAt = this._updatedAt;
  if (!updatedAt) {
    updatedAt = this._updatedAt = new ReactiveVar(new Date());
  }
  return updatedAt;
};

// make get, set, and save reactive
var prevGetFn = Graviton.Model.prototype.get;
Graviton.Model.prototype.get = function() {
  var updatedAt = this.getUpdatedAt().get();
  return prevGetFn.apply(this, arguments);
};

var prevSetFn = Graviton.Model.prototype.set;
Graviton.Model.prototype.set = function() {
  var updatedAt = this.getUpdatedAt();
  updatedAt.set(new Date());
  return prevSetFn.apply(this, arguments);
};

var prevSaveFn = Graviton.Model.prototype.save;
Graviton.Model.prototype.save = function() {
  var updatedAt = this.getUpdatedAt();
  updatedAt.set(new Date());
  return prevSaveFn.apply(this, arguments);
};
