

$(function() {

  var isCheckedIn = false;
  var isLoggedIn = false;



  // first time sharing popup message
  firebase.auth().onAuthStateChanged(function(user) {
    // console.log("HI");
    // console.log(user);
    if(user) {
      isLoggedIn = true;
      var userId = user.uid;
      // console.log("HEY");

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
          var isCheckedIn = val.isCheckedIn;
          var lastCheckedInDate = val.lastCheckedInDate;

          if(lastCheckedInDate == getToday()) {
            console.log("SAME!");
            disableCheckInBtn();
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
    // console.log("Date: " + date);
    // console.log("MM: " + (date.getMonth() + 1));
    // console.log("DD: " + date.getDate());
    // console.log("YYYY: " + date.getFullYear());
    var today = "" + date.getDate() + (date.getMonth() + 1) + date.getFullYear();
    // console.log(today);
    return today;
  })();





  function disableCheckInBtn() {
    $('.btn-checkin').prop('disabled', true);
    $('.btn-checkin').addClass('btn-secondary');
  }


  function enableCheckInBtn() {
    $('.btn-checkin').prop('disabled', false);
    $('.btn-checkin').removeClass('btn-secondary');
  }





  // checkin button
  $('.btn-checkin').click(function() {

    var userId = firebase.auth().currentUser.uid;

    database.ref('/checkins/' + userId).once('value').then(function(snapshot) {
      var isCheckedIn = (snapshot.val() && snapshot.val().isCheckedIn);
      console.log("isCheckedIn: " + isCheckedIn);
      console.log("daysTotal: " + localStorage.daysTotal);


      if(isCheckedIn == false) {
        // 체크인 버튼 누를 때 오늘(new Date()) 날짜를 얻고 checkedDate에 string으로 저장하고, isCheckedIn을 true로 변경한다.
        // 페이지 로딩할 때 checkedDate이 new Date()과 다르면 isCheckedIn을 false로 변경하여 버튼을 다시 active로 변경한다.

        // update check in status
        isCheckedIn = true;
        var today = getToday();

        // disable button
        disableCheckInBtn();

        // change the day streak number
        var dayStreak = ++localStorage.dayStreak;
        $('.daystreak').text(dayStreak);

        // update cloud
        var data = {
          isCheckedIn: isCheckedIn,
          lastCheckedInDate: today,
          dayStreak: dayStreak,
          daysTotal: localStorage.daysTotal
        };

        var updates = {};
        updates['/checkins/' + userId] = data;
        // console.log(updates);
        database.ref().update(updates);

        // fill the circle at the bottom



      }
      else {
        // if already checked in today
        return;
      }

      // test



    });


  });


});
