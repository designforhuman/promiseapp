


$(function() {


  // variables
  var selectedDaysTotal = $('#formControlDaysTotal option:selected');
  var selectedAmount = $('#formControlAmount option:selected');

  localStorage.goal = "Test";
  localStorage.daysTotal = selectedDaysTotal.val();
  localStorage.amount = selectedAmount.val();
  localStorage.rewardOption = "성공하면";
  localStorage.rewardInput = "";
  localStorage.isFirstTime = "false";

  selectedDaysTotal.append( " 일간" );
  selectedAmount.append( " 개씩" );





  // share function
  function share(uid) {
    FB.ui({
      method: 'feed',
      link: 'https://promiseappcom.firebaseapp.com/',

    }, function(response){
      if (response && !response.error_message) {
        // console.log('Posting completed.');
        // console.log("response: " + response);
        // console.log("response_id: " + response.post_id);
        // console.log("response_status: " + response.status);
        localStorage.isFirstTime = true;

        // update database
        updatePromise(uid, localStorage.goal, localStorage.daysTotal, localStorage.amount, localStorage.rewardOption, localStorage.rewardInput, localStorage.isFirstTime);

        // move to checkin page
        window.location.href = 'checkin.html';

      } else {
        // console.log('Error while posting.');

      }

    });
  }





  // if already logged-in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // change text for the register button
      $('.btn-register').text("페이스북 공유");

      $('.btn-register').click(function() {
        localStorage.rewardOption = $('.btn-reward-option label.active').text().replace(/\s/g, "");
        localStorage.rewardInput = $('#rewardInput').val();
        // console.log("RO2: " + localStorage.rewardOption);
        share(user.uid);
      });

    } else {
      // No user is signed in.

      // register and share
      $('.btn-register').click(function() {

        localStorage.rewardOption = $('.btn-reward-option label.active').text().replace(/\s/g, "");
        localStorage.rewardInput = $('#rewardInput').val();
        // console.log("RO1: " + localStorage.rewardOption);


        firebase.auth().signInWithPopup(provider).then(function(result) {
          // The signed-in user info.

          // write user data async
          var user = result.user;
          writeUserData(user.uid, user.displayName, user.email);

          share(user.uid);



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

      });

    }
  });





  // habit category: modal
  $('#modalHabit .list-group-item[data-toggle="list"]').on('shown.bs.tab', function (e) {
    localStorage.goal = e.target.text;
  });

  $('#modalHabit .btn-primary').click(function() {
    $('.btn-habit-category').text(localStorage.goal + "를");
    $('.btn-habit-category').addClass('btn-outline-dark');
    $('#modalHabit').modal('hide');
  });





  // daysTotal
  $('#formControldaysTotal').change(function() {
    $('#formControldaysTotal option').each(function() {
      $(this).text( $(this).val() );
    });
    var selectedOption = $('#formControldaysTotal option:selected');
    selectedOption.append( " 일간" );
    localStorage.daysTotal = selectedOption.val();
  });




  // amount
  $('#formControlAmount').change(function() {
    $('#formControlAmount option').each(function() {
      $(this).text( $(this).val() );
    });
    var selectedOption = $('#formControlAmount option:selected')
    selectedOption.append( " 개씩" );
    localStorage.amount = selectedOption.val();
  });




  // write data
  function writeUserData(userId, name, email) {
    database.ref('users/' + userId).set({
      userName: name,
      email: email,
    });
  }


  function updatePromise(userId, goal, daysTotal, amount, rewardOption, rewardInput, isFirstTime) {
    // console.log("USERID: " + userId);
    // console.log("RO: " + goal);
    database.ref('promises/' + userId).set({
      goal: goal,
      daysTotal: daysTotal,
      amount: amount,
      rewardOption: rewardOption,
      rewardInput: rewardInput,
      isFirstTime: isFirstTime,
    });

    // clear local storage
    // localStorage.clear();
  }







});
