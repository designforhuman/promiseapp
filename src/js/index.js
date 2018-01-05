


// facebook auth
var provider = new firebase.auth.FacebookAuthProvider();


// detect if it is mobile
var isMobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobile|Kindle|Windows Phone|PSP|AvantGo|Atomic Web Browser|Blazer|Chrome Mobile|Dolphin|Dolfin|Doris|GO Browser|Jasmine|MicroB|Mobile Firefox|Mobile Safari|Mobile Silk|Motorola Internet Browser|NetFront|NineSky|Nokia Web Browser|Obigo|Openwave Mobile Browser|Palm Pre web browser|Polaris|PS Vita browser|Puffin|QQbrowser|SEMC Browser|Skyfire|Tear|TeaShark|UC Browser|uZard Web|wOSBrowser|Yandex.Browser mobile/i.test(navigator.userAgent)) {
  isMobile = true;
}



// load categories from JSON file
var goals = {};
var goalControlNames = [];
var goalNames = [];
var goalAmounts = [];
var goalUnits = [];
var goalIsEveryday = [];
var goalIndices = [];

$.getJSON("/data/goals.json", function(data) {
  goals = data;
  $.each(data, function(key, value) {
    goalControlNames.push(key);
    goalNames.push(value.name);
    goalAmounts.push(value.amount);
    goalUnits.push(value.unit);
    goalIsEveryday.push(value.everyday);
  });
});



$(function() {


  // variables
  var selectedUnit = "";
  var selectedDaysTotal = $('#formControlDaysTotal option:selected');
  var selectedAmount = $('#formControlAmount option:selected');

  localStorage.goal = "";
  localStorage.daysTotal = selectedDaysTotal.val();
  localStorage.amount = selectedAmount.val();
  localStorage.rewardOption = "성공하면";
  localStorage.rewardInput = "";
  localStorage.isFirstTime = "false";

  selectedDaysTotal.append( " 일간" );
  selectedAmount.append( " 개씩" );





  // share function
  function share(uid) {
    if(isMobile) {

    } else {

      FB.ui({
        method: 'share',
        mobile_iframe: true,
        href: 'https://promiseappcom.firebaseapp.com/',

      }, function(response){
        if (response && !response.error_message) {
          localStorage.isFirstTime = true;

          // update database
          updatePromise(uid, localStorage.goal, localStorage.daysTotal, localStorage.amount, localStorage.rewardOption, localStorage.rewardInput, localStorage.isFirstTime);

          // move to checkin page
          // console.log('Move to checkin page.');
          // window.open('checkin.html');
          window.location.href = 'checkin.html';
        } else {
          // console.log('Error while posting.');
        }
      });

    }
  }


  $('#shareBtn').click(function() {

    var body = 'Reading JS SDK documentation';
    FB.api('/me/feed', 'post', { message: body }, function(response) {
      if (!response || response.error) {
        alert('Error occured');
      } else {
        alert('Post ID: ' + response.id);
      }
    });

    // e.preventDefault();
    // FB.ui({
    //   method: 'share',
    //   mobile_iframe: true,
    //   href: 'https://developers.facebook.com/docs/',
    // }, function(response){});

    // FB.ui({
    //   method: 'share_open_graph',
    //   action_type: 'og.likes',
    //   action_properties: JSON.stringify({
    //     object:'https://developers.facebook.com/docs/',
    //   })
    // }, function(response){});
  });





  if(isMobile) {
    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var token = result.credential.accessToken;

        // write user data async
        var user = result.user;
        writeUserData(user.uid, user.displayName, user.email);

        // share
        console.log("SHARE AFTER REDIRECTED");
        share(user.uid);

      }
      // The signed-in user info.
      var user = result.user;
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



  // if already logged-in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // change text for the register button
      $('.btn-register').text("페이스북 공유");
    }

    // register and share
    $('.btn-register').click(function() {

      localStorage.rewardOption = $('.btn-reward-option label.active').text().replace(/\s/g, "");
      localStorage.rewardInput = $('#rewardInput').val();

      if(isMobile) {
        // console.log("MOBILE");
        firebase.auth().signInWithRedirect(provider);
      } else {
        // console.log("DESKTOP");
        firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          // ...
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
  });



  // render goals

  for(i=0; i<goalControlNames.length; i++) {
    $('#goalList').append( '<a class="list-group-item list-group-item-action" data-toggle="list" role="tab" aria-controls="' + goalControlNames[i] + '" data-index="' + i + '">' + goalNames[i] + '</a>' );
  }

  // habit category: modal
  // upon goal selected
  $('#modalHabit .list-group-item[data-toggle="list"]').on('shown.bs.tab', function (e) {
    localStorage.goal = e.target.text;
    // console.log( $(this).attr('aria-controls') );
    // console.log($(this).data('index'));
    $('.btn-habit-category').text(localStorage.goal + "를");
    $('.btn-habit-category').addClass('btn-outline-dark');
    $('#modalHabit').modal('hide');

    var selectedGoalName = $(this).attr('aria-controls');

    // re-render amounts
    $('#formControlAmount').empty();
    var selectedAmounts = goals[selectedGoalName].amount;
    selectedUnit = goals[selectedGoalName].unit;

    for(i=0; i<selectedAmounts.length; i++) {
      $('#formControlAmount').append( '<option value="' + selectedAmounts[i] + '">' + selectedAmounts[i] + '</option>' );
      if(i == 0) {
        $('#formControlAmount option:selected').append( " " + selectedUnit );
        // save the initial value
        localStorage.amount = selectedAmounts[i];
      }
    }


    // change ending phrase depends on the goal
    if( goals[selectedGoalName].everyday == false ) {
      $('.promise-text').text("할 것을 페이스북 친구들에게 약속합니다.");
      $('.promise-text-sub').text("");
    } else {
      $('.promise-text').text("매일 실행할 것을 페이스북 친구들에게 약속합니다.");
      $('.promise-text-sub').text("3일 결석까지 인정");
    }
  });


  $('#modalHabit .btn-primary').click(function() {
    $('#modalHabit').modal('hide');
  });



  // amount
  $('#formControlAmount').change(function() {
    // show the unit only for the selected one
    $('#formControlAmount option').each(function() {
      $(this).text( $(this).val() );
    });
    var selectedOption = $('#formControlAmount option:selected')
    selectedOption.append( " " + selectedUnit );

    // save to local storage for checkin screen
    localStorage.amount = selectedOption.val();
  });



  // daysTotal
  $('#formControlDaysTotal').change(function() {
    $('#formControlDaysTotal option').each(function() {
      $(this).text( $(this).val() );
    });
    var selectedOption = $('#formControlDaysTotal option:selected');
    selectedOption.append( " 일간" );

    // save to local storage for checkin screen
    localStorage.daysTotal = selectedOption.val();
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
