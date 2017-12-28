

$(function() {

  // variables
  var progressLog = [];
  var shouldGetDaysTotal = false;
  var dayStreak = "";




  // diable check in button by default
  disableCheckInBtn();



  // fill progress dots
  function fillProgressDots(total) {
    for(i=0; i<total; i++) {
      $('.checkInProgress .row').append('<div class="col-4 col-md-2 progressDotContainer"><div class="progressDot align-items-center"></div></div>');
    }
  }

  function updateProgressDots(checkedInTotal) {
    $('.checkInProgress .progressDot:lt(' + checkedInTotal + ')').addClass("bg-primary");
  }




  // first time sharing popup message
  firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
      // isLoggedIn = true;
      var userId = user.uid;

      return database.ref('/promises/' + userId).once('value').then(function(snapshot) {
        var value = snapshot.val();
        var isFirstTime = value.isFirstTime;
        var daysTotal = value.daysTotal;
        var amount = value.amount;
        var goal = value.goal;
        var rewardOption = value.rewardOption;
        var rewardInput = value.rewardInput;

        // show popup
        // console.log("FIRST: " + isFirstTime);
        if(isFirstTime) {
          $('#modalShareSuccessful').modal('show');
          var updates = {};
          updates['/promises/' + userId + '/isFirstTime'] = false;
          // console.log(updates);
          database.ref().update(updates);
        }

        // console.log(snapshot.val().amount);
        $('.goal').text('목표: ' + daysTotal + '일간 매일 ' + amount + '개씩 ' + goal);
        $('.reward').text(rewardOption + ' ' + rewardInput);

        // status check
        // diable checkin button if already done for today
        // read day streak
        database.ref('/checkins/' + userId).once('value').then(function(snapshot) {
          var val = snapshot.val();
          // var isCheckedIn = val.isCheckedIn;
          var lastCheckedInDate = val.lastCheckedInDate;
          dayStreak = val.dayStreak;
          // console.log("DAYSTREAK: " + dayStreak);
          $('.btn-checkin').text(dayStreak);

          // check if there is already a previous progress
          // if so, copy the existing one from cloud
          if(val.progressLog != undefined) {
            progressLog = val.progressLog;
          }

          // fill progress dots
          fillProgressDots(daysTotal);
          updateProgressDots(dayStreak);

          if(lastCheckedInDate == getToday()) {
            console.log("SAME!");
          } else {
            console.log("DIFFERENT!");
            enableCheckInBtn();
          }

        });


      });
    }
  });




  $('#modalShareSuccessful .btn-primary').click(function() {
    $('#modalShareSuccessful').modal('hide');
  });




  // get today
  var getToday;
  (getToday = function() {
    var date = new Date();
    var today = "" + date.getDate() + (date.getMonth() + 1) + date.getFullYear();
    return today;
  })();





  function disableCheckInBtn() {
    $('.btn-checkin').prop('disabled', true);
    $('.btn-checkin').removeClass('btn-primary');
    $('.btn-checkin').addClass('btn-secondary');
  }


  function enableCheckInBtn() {
    $('.btn-checkin').prop('disabled', false);
    $('.btn-checkin').removeClass('btn-secondary');
    $('.btn-checkin').addClass('btn-primary');
  }





  // checkin button
  $('.btn-checkin').click(function() {

    var userId = firebase.auth().currentUser.uid;

    // update check in status
    // isCheckedIn = true;
    var today = getToday();

    // disable button
    disableCheckInBtn();

    // change the day streak number
    $('.btn-checkin').text(++dayStreak);

    // add today's checkin
    progressLog.push(true);

    // redraw progress dots
    updateProgressDots(dayStreak);

    // update cloud
    var dataCheckIn = {
      // isCheckedIn: isCheckedIn,
      lastCheckedInDate: today,
      dayStreak: dayStreak,
      daysTotal: localStorage.daysTotal,
      progressLog: progressLog,
    };


    var updates = {};
    updates['/checkins/' + userId] = dataCheckIn;
    database.ref().update(updates);



  });






});
