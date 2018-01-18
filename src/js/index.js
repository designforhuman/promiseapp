

// facebook auth
var provider = new firebase.auth.FacebookAuthProvider();
// provider.addScope('publish_actions');


// detect if it is mobile
var isMobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobile|Kindle|Windows Phone|PSP|AvantGo|Atomic Web Browser|Blazer|Chrome Mobile|Dolphin|Dolfin|Doris|GO Browser|Jasmine|MicroB|Mobile Firefox|Mobile Safari|Mobile Silk|Motorola Internet Browser|NetFront|NineSky|Nokia Web Browser|Obigo|Openwave Mobile Browser|Palm Pre web browser|Polaris|PS Vita browser|Puffin|QQbrowser|SEMC Browser|Skyfire|Tear|TeaShark|UC Browser|uZard Web|wOSBrowser|Yandex.Browser mobile/i.test(navigator.userAgent)) {
  isMobile = true;
}

// set the default register button state
$('.btn-register').prop('disabled', true);





$(function() {
  if(localStorage.loggedIn === "true") {
    $('.btn-register').text("loading...");
    $('.btn-register').prop('disabled', true);
    localStorage.loggedIn = "false";
  } else {
    $('.btn-register').prop('disabled', false);
  }



  // database.ref()



  if(isMobile) {
    firebase.auth().getRedirectResult().then(function(result) {
      // send to checkin page if already singed up
      ///////////////

      if (result.credential) {
        // write user data async
        var user = result.user;
        var token = result.credential.accessToken;
        var fbId = 0;
        var profilePhotoUrl = "";
        user.providerData.forEach(function (profile) {
          fbId = profile.uid;
          profilePhotoUrl = profile.photoURL;
        });
        writeUserData(user.uid, user.displayName, user.email, token, fbId);
        // window.location.href = '/promise.html';
      }

    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }



  // register and share
  $('.btn-register').click(function() {
    // disable button
    $(this).text("loading...");
    $(this).prop('disabled', true);
    localStorage.loggedIn = "true";

    if(isMobile) {
      // console.log("MOBILE");
      firebase.auth().signInWithRedirect(provider);


    } else {
      // console.log("DESKTOP");
      firebase.auth().signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;
        var fbId = 0;
        var profilePhotoUrl = "";
        user.providerData.forEach(function (profile) {
          fbId = profile.uid;
          profilePhotoUrl = profile.photoURL;
        });
        writeUserData(user.uid, user.displayName, user.email, token, fbId);

      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
    }

  });


  // write data
  function writeUserData(userId, name, email, token, fbId) {

    // for callback
    var ref = database.ref('users/' + userId);
    ref.transaction(function(currentData) {
      if (currentData === null) {
        return { userName: name, email: email, token: token, fbId: fbId };
        // return updates;
      } else {
        // console.log('User already exists.');
        return; // Abort the transaction.
      }
    }, function(error, committed, snapshot) {
      window.location.href = '/promise.html';
    });


    // get FB Id
    // var fbId = "";
    // var updates = {};
    //
    // $.ajax({
    //   url: 'https://graph.facebook.com/me?fields=id&access_token=' + token,
    //   success: function(response) {
    //       // alert(response.id);
    //       fbId = response.id;
    //
    //       // for callback
    //       var ref = database.ref('users/' + userId);
    //       ref.transaction(function(currentData) {
    //         if (currentData === null) {
    //           return { userName: name, email: email, token: token, fbId: fbId };
    //           // return updates;
    //         } else {
    //           // console.log('User already exists.');
    //           return; // Abort the transaction.
    //         }
    //       }, function(error, committed, snapshot) {
    //         // if (error) {
    //         //   console.log('Transaction failed abnormally!', error);
    //         // } else if (!committed) {
    //         //   console.log('We aborted the transaction (because ada already exists).');
    //         // } else {
    //         //   console.log('User added!');
    //         // }
    //         // console.log("data: ", snapshot.val());
    //         window.location.href = '/promise.html';
    //       });
    //   }
    // });
  }




});
