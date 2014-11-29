var steps = [
  {
    id: 0,
    title: 'Select Transition',
  },
  {
    id: 1,
    title: 'Start Song',
  },
  {
    id: 2,
    title: 'End Song',
  },
];

Template.Steps.helpers({
  steps: function() {
    var currentStep = Session.get('uploaderStep');
    return steps.map(function(step) {
      if (step.id === currentStep) {
        step.stateClass = 'active step';
      } else if (step.id > currentStep) {
        step.stateClass = 'disabled step';
      } else {
        step.stateClass = 'completed step';
      }
      return step;
    });
  }
});

Template.Step.events({
  click: function(e, template) {
    console.log("step clicked");
  }
});