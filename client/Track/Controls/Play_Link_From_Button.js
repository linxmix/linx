Template.Play_Link_From_Button.created = function() {
  Utils.initTemplateModel.call(this, 'wave');
};

function getWave(template) {
  return template.data.wave;
}

Template.Play_Link_From_Button.events({
  'click .playLinkFrom': function(e, template) {
    var wave = getWave(template);
    wave.playLinkFrom();
  },
});
