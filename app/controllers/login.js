import Ember from 'ember';

export default Ember.Controller.extend({
  userSession: Ember.inject.service(),

  identification: null,
  password: null,
  errorMessage: null,

  actions: {
    login() {
      const { identification, password } = this.getProperties('identification', 'password');

      console.log('login', identification, password)
      this.get('userSession').open('firebase', {
        provider: 'password',
        email: identification,
        password,
      }).then(
        () => this.transitionToRoute('mixes'),
        (error) => this.set('errorMessage', error.message)
      );
    },

    logout() {
      this.get('userSession').close();
    },
  },
});
