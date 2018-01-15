
$.param = function(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if(results == null) {
    return null;
  }
	return decodeURI(results[1]) || 0;
}


$(function() {

  var _MS_PER_DAY = 1000 * 60 * 60 * 24; //86400000

  // fill progress dots
  function fillProgressDots(total) {
    for(i=0; i<total; i++) {
      $('.checkin-progress .row').append('<div class="col-4 col-md-2 progressDotContainer"><div class="progressDot align-items-center day' + i + '"></div></div>');
    }
  }

  function updateProgressDots(progressLog) {
    for(i=0; i<progressLog.length; i++) {
      if(progressLog[i]) {
        $('.checkin-progress .day' + i + '').addClass("bg-primary");
      } else {
        $('.checkin-progress .day' + i + '').addClass("bg-danger");
      }
    }
  }

  function updateProgress(daysPassed, percentage) {
    $('.checkin-progress-title .daystreak').text(daysPassed + "/" + localStorage.daysTotal);
    $('.checkin-progress-title .percentage').text(percentage.toPrecision(2));
  }



  // read url
  var id = $.param('id');

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



});
