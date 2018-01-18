

var didShare = false;
var todayDOM = "";


if(window.location.href.indexOf('error') != -1) {
  localStorage.didShare = "false";
  alert('공유해야 다음 단계로 넘어가실 수 있습니다.');
  window.location.href = 'https://promiseapp.co/promise.html';
} else {
  localStorage.didShare = "true";
  didShare = true;
}


// function to read url variables
$.param = function(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if(results == null) {
    return null;
  }
	return decodeURI(results[1]) || 0;
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
    // disableCheckInBtn();


    function fillProgressDots(total) {
      for(i=0; i<total; i++) {
        $('.checkin-progress .row').append('<div class="col-4 col-md-2 progress-dot-container"><div class="progress-dot align-items-center day' + i + '"></div></div>');
      }
    }

    function updateProgressDots(progressLog) {
      var daysDone = progressLog.length;
      for(i=0; i<daysDone; i++) {
        if(progressLog[i]) {
          // $('.checkin-progress .day' + i).addClass("bg-primary");
          var checkInPrgressDOM = $('.checkin-progress .day' + i);
          checkInPrgressDOM.addClass("bg-primary");
          checkInPrgressDOM.append('<div class="icon-check-container"><i class="far fa-check fa-lg icon-check-checked"></i></div>');
        } else {
          $('.checkin-progress .day' + i).addClass("bg-danger");
        }
      }
    }


    // fill progress dots
    if(localStorage.daysTotal != undefined) {
      fillProgressDots(localStorage.daysTotal);
    }




    // first time sharing popup message
    firebase.auth().onAuthStateChanged(function(user) {
      if(user) {
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
            // show popup
            $('#modalShareSuccessful').modal('show');

            // change isFirstTime to false on DB
            var updates = {};
            updates['/checkins/' + userId + '/isFirstTime'] = false;
            // console.log(updates);
            database.ref().update(updates);
          }

          // console.log(lastCheckedInDate);
          if(lastCheckedInDate === 0) {
            // if it is the first time (different from isFirstTime because this keeps at 0 when even refresh)
            todayDOM = $('.checkin-progress .day0');
            // todayDOM.addClass("border-today-enabled");
            todayDOM.append('<div class="icon-check-container"><i class="far fa-check fa-lg icon-check-enabled"></i></div>');
            enableCheckInBtn(todayDOM);
          } else {
            // after the very first checkin
            var dateDifference = calcDateDifference(lastCheckedInDate);
            // console.log("DIFF: " + dateDifference);
            if(dateDifference != 0) {
              todayDOM = $('.checkin-progress .day' + dateDifference);
              // todayDOM.addClass("border-today-enabled");
              todayDOM.append('<div class="icon-check-container"><i class="far fa-check fa-lg icon-check-enabled"></i></div>');
              enableCheckInBtn(todayDOM);
            }
          }

          // fill progress dots
          if(localStorage.daysTotal === undefined) {
            fillProgressDots(daysTotal);
          }
          updateProgress(progressLog.length, (progressLog.length * 100) / daysTotal);
          updateProgressDots(progressLog);

        });
      } else {
        // console.log("not a user");
        // read url
        var id = $.param('id');
        if(id != null) {
          database.ref('/checkins/' + id).once('value').then(function(snapshot) {
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
            var progressLog = val.progressLog;

            // console.log(snapshot.val().amount);
            $('.goal').text('목표: ' + daysTotal + '일간 매일 ' + amount + unit + ' ' + goal);
            $('.reward').text(rewardOption + ' ' + rewardInput);

            fillProgressDots(daysTotal);
            updateProgressDots(progressLog);
            updateProgress(progressLog.length, (progressLog.length * 100) / localStorage.daysTotal);
          });
        }
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
      var today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
      // console.log(today);
      return today;
    }
    // getToday();

    // for debugging
    // var date2 = new Date("2018/01/19");
    // var today2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    // console.log( today2 );


    function calcDateDifference(lastCheckedInDate) {
      // console.log( (getToday() - lastCheckedInDate) / _MS_PER_DAY );
      // return (getToday() - lastCheckedInDate) / _MS_PER_DAY;
      return (getToday() - lastCheckedInDate) / _MS_PER_DAY; // for debugging
      //1516233600000 1/18
      //1516320000000 1/19
    }



    // function disableCheckInBtn() {
    //   $('.btn-checkin').prop('disabled', true);
    //   $('.btn-checkin').removeClass('btn-checkin-enabled');
    //   // $('.btn-checkin').addClass('btn-secondary');
    //   $('.icon-check-container').removeClass('icon-check-container-enabled');
    // }


    // function enableCheckInBtn() {
    //   $('.btn-checkin').prop('disabled', false);
    //   // $('.btn-checkin').removeClass('btn-secondary');
    //   $('.btn-checkin').addClass('btn-checkin-enabled');
    //   $('.icon-check-container').addClass('icon-check-container-enabled');
    // }



    function enableCheckInBtn(todayDOM) {
      // console.log(todayDOM);
      todayDOM.on('click', function() {
        var user = firebase.auth().currentUser;
        if (user) {
          // disable button
          // todayDOM.removeClass('border-today-enabled');
          todayDOM.find('svg').removeClass('icon-check-enabled');
          todayDOM.find('svg').addClass('icon-check-checked');
          todayDOM.off();

          var userId = user.uid;

          var today = getToday();

          // change the day streak number
          ++dayStreak;

          // add today's checkin
          var dayDifference = 0;
          if(lastCheckedInDate != 0) {
            dayDifference = calcDateDifference(lastCheckedInDate);
            // console.log(dayDifference);
          }

          for(i=0; i<dayDifference-1; i++) {
            progressLog.push(false);
            // console.log(dayDifference);
          }
          progressLog.push(true);


          // redraw progress dots
          updateProgressDots(progressLog);
          updateProgress(progressLog.length, (progressLog.length * 100) / localStorage.daysTotal);

          // update DB
          var data = {
            lastCheckedInDate: today,
            dayStreak: dayStreak,
            progressLog: progressLog,
          };

          var updates = {};
          updates['/checkins/' + userId + '/lastCheckedInDate'] = data.lastCheckedInDate;
          updates['/checkins/' + userId + '/dayStreak'] = data.dayStreak;
          updates['/checkins/' + userId + '/progressLog'] = data.progressLog;
          database.ref().update(updates);
        } else {
          // No user is signed in.
        }

      });
    }



    function updateProgress(daysPassed, percentage) {
      $('.checkin-progress-title .daystreak').text(daysPassed + "/" + localStorage.daysTotal);
      $('.checkin-progress-title .percentage').text(percentage.toPrecision(2));
    }


  }
});
