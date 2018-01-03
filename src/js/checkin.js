

$(function() {

  // variables
  var _MS_PER_DAY = 1000 * 60 * 60 * 24; //86400000
  var progressLog = [];
  var shouldGetDaysTotal = false;
  var dayStreak = 0;
  var lastCheckedInDate = 0;




  // diable check in button by default
  disableCheckInBtn();



  // fill progress dots
  function fillProgressDots(total) {
    for(i=0; i<total; i++) {
      $('.checkInProgress .row').append('<div class="col-4 col-md-2 progressDotContainer"><div class="progressDot align-items-center day' + i + '"></div></div>');
    }
  }

  function updateProgressDots(progressLog) {
    // $('.checkInProgress .progressDot:lt(' + checkedInTotal + ')').addClass("bg-primary");

    for(i=0; i<progressLog.length; i++) {
      if(progressLog[i]) {
        $('.checkInProgress .day' + i + '').addClass("bg-primary");
      } else {
        $('.checkInProgress .day' + i + '').addClass("bg-danger");
      }
    }
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
        }

        // console.log(snapshot.val().amount);
        $('.goal').text('목표: ' + daysTotal + '일간 매일 ' + amount + '개씩 ' + goal);
        $('.reward').text(rewardOption + ' ' + rewardInput);

        // status check
        // diable checkin button if already done for today
        // read day streak
        database.ref('/checkins/' + userId).once('value').then(function(snapshot) {
          var val = snapshot.val();
          if(!isFirstTime) {
            lastCheckedInDate = val.lastCheckedInDate;
            dayStreak = val.dayStreak;

            // check if there is already a previous progress
            // if so, copy the existing one from cloud
            if(val.progressLog != undefined) {
              progressLog = val.progressLog;
            }
          } else {
            var updates = {};
            updates['/promises/' + userId + '/isFirstTime'] = false;
            // console.log(updates);
            database.ref().update(updates);
          }

          // console.log("DAYSTREAK: " + dayStreak);
          $('.btn-checkin').text(dayStreak);

          // fill progress dots
          fillProgressDots(daysTotal);
          updateProgressDots(progressLog);

          if( calcDateDifference(lastCheckedInDate) == 0) {
            // if already checked in today
            // console.log("SAME!");
          } else {
            // console.log("DIFFERENT!");
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
  // var getToday;
  function getToday() {
    var date = new Date();
    // console.log(date);
    // var today = "" + date.getDate() + (date.getMonth() + 1) + date.getFullYear();
    var today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    // var today = "" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    // console.log( Math.floor(today/_MS_PER_DAY) );
    // console.log(today);
    return today;
  }
  // getToday();


  function calcDateDifference(lastCheckedInDate) {
    // console.log( (getToday() - lastCheckedInDate) / _MS_PER_DAY );
    return (getToday() - lastCheckedInDate) / _MS_PER_DAY;
  }





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
    var dayDifference = 0;
    if(lastCheckedInDate != 0) {
      dayDifference = calcDateDifference(lastCheckedInDate);
    }

    for(i=0; i<dayDifference; i++) {
      progressLog.push(false);
    }
    progressLog.push(true);


    // redraw progress dots
    // updateProgressDots(dayStreak);
    updateProgressDots(progressLog);

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
    // console.log(progressLog);



  });






});
