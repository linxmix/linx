var isProd = require('./utils').isProduction;

module.exports = {

  // soundcloud
  clientId: isProd ?
    "9df28962ed6bfc393d16ca291760fbc2" :
    "977ed530a2104a95eaa87f26fa710941",
  redirectUri: isProd ?
    "http://linx.dj/callback.html" :
    "http://localhost:4000/callback.html",

  // echonest
  echoApiKey: "CWBME38JDGQNEJPXT",
  
  widgetModel: "Wave",
  startPage: 'Welcome',
}