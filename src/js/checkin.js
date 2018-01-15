

var didShare = false;


if(window.location.href.indexOf('error') != -1) {
  localStorage.didShare = "false";
  alert('공유해야 다음 단계로 넘어가실 수 있습니다.');
  window.location.href = 'https://promise.davidlee.kr/promise.html';
} else {
  localStorage.didShare = "true";
  didShare = true;
}




$(function() {
  if(didShare) {


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
        $('.checkin-progress .row').append('<div class="col-4 col-md-2 progressDotContainer"><div class="progressDot align-items-center day' + i + '"></div></div>');
      }
    }

    function updateProgressDots(progressLog) {
      // $('.checkInProgress .progressDot:lt(' + checkedInTotal + ')').addClass("bg-primary");

      for(i=0; i<progressLog.length; i++) {
        if(progressLog[i]) {
          $('.checkin-progress .day' + i + '').addClass("bg-primary");
        } else {
          $('.checkin-progress .day' + i + '').addClass("bg-danger");
        }
      }
    }




    // first time sharing popup message
    firebase.auth().onAuthStateChanged(function(user) {
      if(user) {
        // isLoggedIn = true;
        var userId = user.uid;

        return database.ref('/checkins/' + userId).once('value').then(function(snapshot) {
          var val = snapshot.val();
          var info = snapshot.child('info').val();
          // console.log(value);
          // console.log(snapshot.child('info').val());
          var daysTotal = info.daysTotal;
          var amount = info.amount;
          var unit = info.unit;
          var goal = info.goal;
          var rewardOption = info.rewardOption;
          var rewardInput = info.rewardInput;
          var isFirstTime = val.isFirstTime;

          // show popup
          // console.log("FIRST: " + isFirstTime);
          if(isFirstTime) {
            $('#modalShareSuccessful').modal('show');
          }

          // console.log(snapshot.val().amount);
          $('.goal').text('목표: ' + daysTotal + '일간 매일 ' + amount + unit + ' ' + goal);
          $('.reward').text(rewardOption + ' ' + rewardInput);

          // status check
          // diable checkin button if already done for today
          // read day streak
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
            updates['/checkins/' + userId + '/isFirstTime'] = false;
            // console.log(updates);
            database.ref().update(updates);
          }

          // console.log("DAYSTREAK: " + dayStreak);
          // $('.btn-checkin').text(dayStreak);

          // fill progress dots
          updateProgress(progressLog.length, (progressLog.length * 100) / daysTotal);
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
      $('.btn-checkin').removeClass('btn-checkin-enabled');
      // $('.btn-checkin').addClass('btn-secondary');
      $('.icon-check-container').removeClass('icon-check-container-enabled');
    }


    function enableCheckInBtn() {
      $('.btn-checkin').prop('disabled', false);
      // $('.btn-checkin').removeClass('btn-secondary');
      $('.btn-checkin').addClass('btn-checkin-enabled');
      $('.icon-check-container').addClass('icon-check-container-enabled');
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
      ++dayStreak;
      // $('.btn-checkin').text(++dayStreak);

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
      updateProgress(progressLog.length, (progressLog.length * 100) / localStorage.daysTotal);

      // update cloud
      var data = {
        // isCheckedIn: isCheckedIn,
        lastCheckedInDate: today,
        dayStreak: dayStreak,
        progressLog: progressLog,
      };


      var updates = {};
      updates['/checkins/' + userId + '/lastCheckedInDate'] = data.lastCheckedInDate;
      updates['/checkins/' + userId + '/dayStreak'] = data.dayStreak;
      updates['/checkins/' + userId + '/progressLog'] = data.progressLog;
      database.ref().update(updates);
      // console.log(progressLog);

    });



    function updateProgress(daysPassed, percentage) {
      $('.checkin-progress-title .daystreak').text(daysPassed + "/" + localStorage.daysTotal);
      $('.checkin-progress-title .percentage').text(percentage.toPrecision(2));
    }



  }
});
