// Augment Graviton Model
Graviton.Model.prototype.isDirty = function() {
  return this._pendingMods.length !== 0;
};
