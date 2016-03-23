export default function pauseTest(context, doneCallback, durationInSeconds = 36000) {
  Ember.Logger.warn(`pauseTest is pausing for ${durationInSeconds} seconds!`);
  context.enableTimeouts(false);
  $('#ember-testing-container').css('height', '100%');
  $('#ember-testing-container').css('width', '100%');
  $('#ember-testing').css('zoom', '100%');
  window.setTimeout(function() {
    Ember.Logger.info('done with timeout');
    doneCallback();
  }, durationInSeconds * 1000);
}
