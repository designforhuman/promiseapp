

$(function() {

  // variables
  var progressLog = [];
  var shouldGetDaysTotal = false;


  // initial setup based on localStorage


  // diable check in button by default
  disableCheckInBtn();


  // render progress dots' background
  if(localStorage.daysTotal != "undefined") {
    for(i=0; i<localStorage.daysTotal; i++) {
      $('.checkInProgress .row').append('<div class="col-4 col-md-2 progressDotContainer"><div class="progressDot align-items-center"></div></div>');
    }
  } else {
    // get daysTotal from cloud
    shouldGetDaysTotal = true;
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

        if(shouldGetDaysTotal) {
          for(i=0; i<daysTotal; i++) {
            $('.checkInProgress .row').append('<div class="col-4 col-md-2 progressDotContainer"><div class="progressDot align-items-center"></div></div>');
          }
          localStorage.daysTotal = daysTotal;
        }


        // status check
        // diable checkin button if already done for today
        // read day streak
        database.ref('/checkins/' + userId).once('value').then(function(snapshot) {
          var val = snapshot.val();
          // var isCheckedIn = val.isCheckedIn;
          var lastCheckedInDate = val.lastCheckedInDate;
          var dayStreak = val.dayStreak;
          $('.dayStreak').text(dayStreak);
          progressLog = val.progressLog;

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
    var dayStreak = ++localStorage.dayStreak;
    $('.dayStreak').text(dayStreak);

    progressLog.push(true);
    console.log(progressLog);

    // update cloud
    var dataCheckIn = {
      // isCheckedIn: isCheckedIn,
      lastCheckedInDate: today,
      dayStreak: dayStreak,
      daysTotal: localStorage.daysTotal,
      progressLog: progressLog,
    };

    // var dataProgress = {
    //   true
    // }

    var updates = {};
    updates['/checkins/' + userId] = dataCheckIn;
    // updates['/checkins/' + userId + '/progressLog'] = progressLog;
    // console.log(updates);
    database.ref().update(updates);

    // database.ref('/checkins/' + userId + '/progressLog/').push(1);

    // fill the circle at the bottom


    // database.ref('/checkins/' + userId).once('value').then(function(snapshot) {
    //   var isCheckedIn = (snapshot.val() && snapshot.val().isCheckedIn);
    //   console.log("isCheckedIn: " + isCheckedIn);
    //   console.log("daysTotal: " + localStorage.daysTotal);
    //
    //
    //   // if(isCheckedIn == false) {
    //     // 체크인 버튼 누를 때 오늘(new Date()) 날짜를 얻고 checkedDate에 string으로 저장하고, isCheckedIn을 true로 변경한다.
    //     // 페이지 로딩할 때 checkedDate이 new Date()과 다르면 isCheckedIn을 false로 변경하여 버튼을 다시 active로 변경한다.
    //
    //
    //
    //
    //   // }
    //
    //
    // });


  });






});
