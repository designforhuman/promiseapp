


// facebook auth
// var provider = new firebase.auth.FacebookAuthProvider();
// provider.addScope('publish_actions, user_posts');



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
var selectedAmount = 0;




// prevent default enter key
$(document).keypress(
  function(event){
    if(event.which === 13) {
      event.preventDefault();
    }
});




$(function() {
  // console.log("USER: " + firebase.auth().currentUser);

  $.ajax({
    cache: false,
    success: function(data) {
      // console.log(data);
      goals = data;
      $.each(data, function(key, value) {
        goalControlNames.push(key);
        goalNames.push(value.name);
        goalAmounts.push(value.amount);
        goalUnits.push(value.unit);
        goalIsEveryday.push(value.everyday);

        // render goals
        $('#goalList').append( '<a class="list-group-item list-group-item-action" data-toggle="list" role="tab" aria-controls="' + key + '">' + value.name + '</a>' );
      });
      // upon goal selected
      $('#modalHabit .list-group-item[data-toggle="list"]').on('shown.bs.tab', function (e) {
        localStorage.goal = e.target.text;

        // remove if there is warning border is enabled
        if( $('.btn-habit-category').hasClass('border-danger') ) {
          $('.btn-habit-category').removeClass('border-danger');
          // $('.btn-habit-category').addClass('border-success');
          $('.invalid-feedback:first').hide();
        }

        // add confirmed visuals and text
        $('.btn-habit-category').addClass('btn-outline-dark');
        $('.btn-habit-category').text(localStorage.goal + "를");

        localStorage.selectedGoalName = $(this).attr('aria-controls');

        // re-render amounts
        $('#formControlAmount').parent().removeClass('d-none');
        if(!$('#formControlAmount2').parent().hasClass('d-none')) {
          $('#formControlAmount2').parent().addClass('d-none');
        }

        $('#formControlAmount').empty();
        var selectedAmounts = goals[localStorage.selectedGoalName].amount;
        localStorage.unit = goals[localStorage.selectedGoalName].unit;

        for(i=0; i<selectedAmounts.length; i++) {
          $('#formControlAmount').append( '<option value="' + selectedAmounts[i] + '">' + selectedAmounts[i] + '</option>' );
          if(i == 0) {
            $('#formControlAmount option:selected').append( " " + localStorage.unit );
            // save the initial value
            selectedAmount = selectedAmounts[i];
          }
        }

        // change ending phrase depends on the goal
        if( goals[localStorage.selectedGoalName].everyday == false ) {
          $('.promise-text').text("할 것을 페이스북 친구들에게 약속합니다.");
          $('.promise-text-sub').text("");
        } else {
          $('.promise-text').text("매일 실행할 것을 페이스북 친구들에게 약속합니다.");
          $('.promise-text-sub').text("3일 결석까지 인정");
        }

        if( $('#goalInput').val().length > 0 ) {
          $('#goalInput').val("");
        }

        $('#modalHabit').modal('hide');
      });

    },
    error: function(xhr, text) {
      // console.log('An error occurred', xhr, text);
    },
    url: "/data/goals.json"
  });



  // if canceled sharing
  if(localStorage.didShare != "true") {
    // fill in previously selected goal and amounts
    //////////
    $('#rewardInput').val(localStorage.rewardInput);
  }



  // variables
  var selectedDaysTotal = $('#formControlDaysTotal option:selected');
  var selectedAmount = $('#formControlAmount option:selected');

  localStorage.daysTotal = selectedDaysTotal.val();
  // selectedAmount = selectedAmount.val();
  localStorage.unit = "";
  localStorage.isFirstTime = "false";

  selectedDaysTotal.append( " 일간" );
  selectedAmount.append( " 개씩" );





  // share function
  function share(uid) {
    // window.location.href = 'https://www.facebook.com/dialog/share?app_id=137706030341228&href=https://promiseappcom.firebaseapp.com/promise.html&redirect_uri=https://promiseappcom.firebaseapp.com/checkin.html';
    if(isMobile) {
      console.log("THIS IS MOBILE");

      // update database
      updatePromise(uid, localStorage.goal, localStorage.daysTotal, selectedAmount, localStorage.unit, localStorage.rewardOption, localStorage.rewardInput, localStorage.isFirstTime);

      var shareUrl = 'https://www.facebook.com/dialog/share?app_id=137706030341228&href=https://promise.davidlee.kr/share.html?promiseid=' + uid + '&redirect_uri=https://promise.davidlee.kr/checkin.html';
      // var shareUrl = "https://www.facebook.com/dialog/share?app_id=137706030341228&display=touch&href=https://promiseappcom.firebaseapp.com/&redirect_uri=https://promiseappcom.firebaseapp.com/checkin.html";
      window.location.href = shareUrl;
      // window.open(shareUrl);


    } else {
      console.log("THIS IS DESKTOP");

      FB.ui({
        method: 'share',
        href: 'https://promise.davidlee.kr/share.html'

      }, function(response){
        if (response && !response.error_message) {
          localStorage.isFirstTime = true;

          // update database
          updatePromise(uid, localStorage.goal, localStorage.daysTotal, selectedAmount, localStorage.unit, localStorage.rewardOption, localStorage.rewardInput, localStorage.isFirstTime);

          // move to checkin page
          // console.log('Move to checkin page.');
          // window.open('checkin.html');
          window.location.href = 'https://promise.davidlee.kr/checkin.html';
        } else {
          // console.log('Error while posting.');
        }
      });
    }
  }





  // save reward to localstorage
  function saveReward() {
    localStorage.rewardOption = $('.btn-reward-option label.active').text().replace(/\s/g, "");
    localStorage.rewardInput = $('#rewardInput').val();
  }


  $('.btn-share').click(function () {
    var isValid = true;
    // console.log("TEST: " + $('.btn-habit-category').text());
    // console.log("TEST: " + $('.btn-habit-category').text().indexOf(" "));
    if( $('.btn-habit-category').text().indexOf(" ") === 1 ) {
      // if the goal is not selected...
      $('.btn-habit-category').addClass('border-danger');
      $('.invalid-feedback:first').show();
      isValid = false;
    }

    if( $('#formControlAmount2').is(':visible') && $('#formControlAmount2').val().length < 1 ) {
      // if unit is visible and not typed...
      $('#formControlAmount2').addClass('border-danger');
      $('.invalid-feedback:eq(1)').show();
      isValid = false;
    }

    if( $('#rewardInput').val().length < 1 ) {
      // if reward is not typed...
      $('#rewardInput').addClass('border-danger');
      $('.invalid-feedback:eq(2)').show();
      isValid = false;
    }

    if(!isValid) {
      return false;
    } else {

      saveReward();

      // see if there is user typed unit, if so, replace the old one
      if( $('#formControlAmount2').val().length > 0 ) {
        localStorage.unit = $('#formControlAmount2').val();
      }

      console.log("SHARE");
      var user = firebase.auth().currentUser;
      if(user) {
        share(user.uid);
      } else {
        console.log("USER ERROR");
      }

    }


  });




  $('#modalHabit .btn-primary').click(function() {
    if( $('#goalInput').val().length > 0 ) {
      $('.btn-habit-category').text( $('#goalInput').val() + "를" );
      $('.btn-habit-category').addClass('btn-outline-dark');

      if(!$('#formControlAmount').parent().hasClass('d-none')) {
        $('#formControlAmount').parent().addClass('d-none');
      }
      $('#formControlAmount2').parent().removeClass('d-none');
    }

    $('#modalHabit').modal('hide');
  });


  // if textfield is being filled..
  $('#goalInput').keyup(function(e) {
    // console.log(e.keyCode);
    if(e.which === 13) {
      // if enter is pressed
      $('#btnGoalConfirm').click();
    }

    if(e.target.value.length > 0) {
      // unselect the other
      $('#modalHabit .active').removeClass('active');
    }
  });


  $('#rewardInput').keyup(function(e) {
    // console.log($('#rewardInput').hasClass('invalid-feedback'));
    if(e.target.value.length > 0) {
      $('.invalid-feedback:eq(2)').hide();
      $(this).addClass('border-dark');
    } else {
      $(this).removeClass('border-dark');
    }
  });



  // amount
  $('#formControlAmount').change(function() {
    // show the unit only for the selected one
    $('#formControlAmount option').each(function() {
      $(this).text( $(this).val() );
    });
    var selectedOption = $('#formControlAmount option:selected')
    selectedOption.append( " " + localStorage.unit );

    // save to local storage for checkin screen
    selectedAmount = selectedOption.val();
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





  function updatePromise(userId, goal, daysTotal, amount, unit, rewardOption, rewardInput, isFirstTime) {

    var promiseData = {
      goal: goal,
      daysTotal: daysTotal,
      amount: amount,
      unit: unit,
      rewardOption: rewardOption,
      rewardInput: rewardInput,
    };

    var checkinData = {
      isFirstTime: isFirstTime,
      dayStreak: 0,
      lastCheckedInDate: 0,
      progressLog: [],
      info: promiseData,
    };

    var updates = {};
    updates['/promises/' + userId] = promiseData;
    updates['/checkins/' + userId] = checkinData;
    // updates['/checkins/' + userId + '/info/'] = promiseData;

    return database.ref().update(updates);

    // database.ref('promises/' + userId).set({
    //   goal: goal,
    //   daysTotal: daysTotal,
    //   amount: amount,
    //   unit: unit,
    //   rewardOption: rewardOption,
    //   rewardInput: rewardInput,
    //   isFirstTime: isFirstTime,
    // });
  }







});
