// Augment SoundTouch
SoundTouch.prototype.clearBuffers = function() {
  this.inputBuffer.clear();
  this._intermediateBuffer.clear();
  this.outputBuffer.clear();
};

SoundTouch.prototype.getSampleReq = function() {
  return this.tdStretch.sampleReq;
};

// fix bug by adding `this.`
SoundTouch.prototype.clear = function() {
  this.rateTransposer.clear();
  this.tdStretch.clear();
};

// fix bug by adding `this.`
FifoSampleBuffer.prototype.clear = function() {
  this.receive(this.frameCount);
  this.rewind();
};
