
// Facebook API
window.fbAsyncInit = function() {
  FB.init({
    appId      : '137706030341228',
    status     : true,
    cookie     : true,
    xfbml      : true,
    version    : 'v2.11',
  });
  FB.AppEvents.logPageView();
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/kr_KO/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));


// getting Firebase DB ready
var config = {
  apiKey: "AIzaSyCnkEAq5943Zd2EhZ4TlKjCUpAqb0Tp8Io",
  authDomain: "promiseappcom.firebaseapp.com",
  databaseURL: "https://promiseappcom.firebaseio.com"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();
