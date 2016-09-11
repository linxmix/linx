import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),

  identification: null,
  password: null,
  errorMessage: null,

  actions: {
    login() {
      const { identification, password } = this.getProperties('identification', 'password');

      console.log('login', identification, password)
      this.get('session').authenticate(
        'authenticator:firebase-simple-auth',
        'firebase-simple-auth',
        {
          provider: 'password',
          email: identification,
          password,
        }
      ).then(
        () => this.transitionTo('mixes'),
        (error) => this.set('errorMessage', error.message)
      );
    },
  },
});
