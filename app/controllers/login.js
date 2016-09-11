import Ember from 'ember';

export default Ember.Controller.extend({
  userSession: Ember.inject.service(),
  firebaseApp: Ember.inject.service(),

  identification: null,
  password: null,
  message: null,

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
        (e) => this.set('message', e.message)
      );
    },

    logout() {
      this.get('userSession').close();
    },

    sendPasswordReset() {
      const auth = this.get('firebaseApp').auth();
      const identification = this.get('userSession.currentUser.email') || this.get('identification');

      if (!identification) {
        this.set('message', 'Must enter an email to send password reset.');
        return;
      }

      auth.sendPasswordResetEmail(identification).then(
        () => this.set('message', `Successfully sent password reset to: ${identification}`),
        (e) => this.set('message', e.message)
      );
    }
  },
});
