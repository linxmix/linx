var steps = [
  {
    id: 1,
    title: 'Select Transition',
  },
  {
    id: 2,
    title: 'Start Song',
  },
  {
    id: 3,
    title: 'End Song',
  },
];

Template.Steps.helpers({
  steps: function() {
    var currentStep = Session.get('uploadStep');
    return steps.map(function(step) {
      if (step.id === currentStep) {
        step.stateClass = 'active step';
      } else if (step.id > currentStep) {
        // step.stateClass = 'disabled step';
        step.stateClass = 'step';
      } else {
        step.stateClass = 'completed step';
      }
      return step;
    });
  }
});

Template.Step.events({
  click: function(e, template) {
    Session.set('uploadStep', template.data.id)
  }
});
