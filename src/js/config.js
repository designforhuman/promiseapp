

// getting Firebase DB ready
var config = {
  apiKey: "AIzaSyCnkEAq5943Zd2EhZ4TlKjCUpAqb0Tp8Io",
  authDomain: "promiseappcom.firebaseapp.com",
  databaseURL: "https://promiseappcom.firebaseio.com"
};
firebase.initializeApp(config);

// facebook auth
var provider = new firebase.auth.FacebookAuthProvider();

// Get a reference to the database service
var database = firebase.database();