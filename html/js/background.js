// Copyright (Jack Sharkey) 2016 Copyright Holder All Rights Reserved.
var allClassOrder = [];
var allClassTimes = [];
var timeInMinutes;
var timeInSeconds;
var timeLeftMinutes;
var timeLeftSeconds;
var timeData;
var scheduleData;
var lunchArray;
var totalTime;
var offset;
var lunchTime;
var totalTimeWithOffset;
var refreshed = false;
var schoolOver = false;
var currentClass;
var startCurrentLunchPeriod;
var realTime;
var today;
var day;
var timeOfDay = 'AM';
var timeIn;
var timeLeft;
var timeLeftWanted;
var startCurrentClassTime;
var endCurrentClassTime;
var nextClass;
var lunchClass;
var isLunch = false;
var waveOneStart;
var waveOneEnd;
var waveTwoStart;
var waveTwoEnd;
var waveThreeStart;
var waveThreeEnd;
var lunchPeriodName;
var lunchPeriodReplaced;
var lunchTimeReplaced;
var waveOneStartResult;
var waveOneEndResult;
var waveTwoStartResult;
var waveTwoEndResult;
var waveThreeStartResult;
var waveThreeEndResult;
var currentSched;
var lastClass;
var currentLunchPeriod;
var school = true;
var passingTime = false;
var nextClassPosition;
var soundOn = false;
var audio;
var lastPeriod = false;
var endCurrentLunchPeriod;
var todayTimeInterval;
var timersInterval;
var createNotificationInterval;
var lunchClassPeriod;

chrome.storage.sync.set({'wentOffline' : false})

// Check whether new version is installed



chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    chrome.storage.sync.set({'hasKeys': 'NO', 'notificationTimeWanted' : 300, 'textHTML' : '5 minutes', 'state' : true, 'sound' : false, 'opened' : false})
    $.ajax({
      method: 'get',
      url: "https://shsschedule.herokuapp.com/push",
      jsonp:false,
      success: function(data ) {
        version = data.version
        chrome.storage.sync.set({'version' : version})
      }
    });
    window.open(chrome.runtime.getURL('/html/options.html'));

  } else if(details.reason == "update"){
    var thisVersion = chrome.runtime.getManifest().version;
    // chrome.notifications.create ({
    //   type: "basic",
    //   title: "Update",
    //   message: "You can now view all assignments by class. Click on the corresponding period number to view all assignments for that certain class.",
    //   iconUrl: "/images/128.png",
    // });

  };
});

setTimeout(function(){
  audio  = new Audio('bell.mp3')
},1000)

function retrieveAJAX (){
  allClassOrder = []
  allClassTimes = []
  $.ajax({
    url: "https://shsschedule.herokuapp.com/time",
    method: 'GET',
    success: function(data){

      timeData = data;
      var currentTime = timeData;
      var totalHours = currentTime.hours
      var totalMinutes = currentTime.mins
      var totalSeconds = currentTime.secs

      totalHours = totalHours*3600
      totalMinutes = totalMinutes*60

      var localTime = new Date();
      var localSeconds = localTime.getSeconds();
      var localMinutes = localTime.getMinutes();
      var localHours = localTime.getHours();

      localTotalTime = (localHours * 3600) + (localMinutes * 60) + localSeconds

      totalTime = totalSeconds + totalMinutes + totalHours;
      offset = totalTime - localTotalTime;

      // offset = -1 * 10 * 60

      $.ajax({
        // url: "https://shsschedule.herokuapp.com/schedule/20170125",
        url: "https://shsschedule.herokuapp.com/schedule/today",
        method: 'GET',
        success: function(data){
          if (typeof data == "object") {
            scheduleData = data;

          } else {
            scheduleData = JSON.parse(data)

          }

          todayTime();
          buildSched();
          timers();
          finalArrays();
          createNotification();
          clearInterval(todayTimeInterval)
          todayTimeInterval = setInterval(todayTime, 500)
          clearInterval(timersInterval)
          timersInterval = setInterval(timers, 500)
          clearInterval(createNotificationInterval);
          createNotificationInterval = setInterval(createNotification, 1000)
        },
      })
      }
    })
  }


  retrieveAJAX();
  setInterval(retrieveAJAX,1000*60*15)

  var hours;
  function todayTime() {
    var localTime = new Date();
    var localSeconds = localTime.getSeconds();
    var localMinutes = localTime.getMinutes();
    var localHours = localTime.getHours();

    localTotalTime = (localHours * 3600) + (localMinutes * 60) + localSeconds



    // totalTimeWithOffset = 27000 + offset;
    totalTimeWithOffset = localTotalTime ;
    totalTimeWithOffset = localTotalTime + offset;

    // change = 900
    // change = change + 900
    // offset = offset + change


    hours = parseInt( totalTimeWithOffset / 3600 ) % 24;
    var minutes = parseInt( totalTimeWithOffset / 60 ) % 60;
    var seconds = totalTimeWithOffset % 60;
    if (hours >= 13) {
      hours = hours - 12;
      timeOfDay = 'PM';
    } else {
      timeOfDay = 'AM'
    }

    var midnight = false;
    if (hours === 0) {
      hours = 12
      midnight = true;
      timeOfDay = 'AM'
    }


    if (hours === 12 && midnight === false) {
      timeOfDay = 'PM'
    }


    realTime = (hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    today = new Date();

    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();


    if(dd<10) {
      dd='0'+dd
    }

    if(mm<10) {
      mm='0'+mm
    }

    day = today.getDay();

    today = mm+'/'+dd

    if (day === 0) {
      day = "Sunday"
    }
    if (day == 1) {
      day = "Monday"
    }
    if (day == 2) {
      day = "Tuesday"
    }
    if (day == 3) {
      day = "Wednesday"
    }
    if (day == 4) {
      day = "Thursday"
    }
    if (day == 5) {
      day = "Friday"
    }
    if (day == 6) {
      day = "Saturday"
    }
    if (day == 7) {
      day = "Monday"
    }


  }

  function buildSched() {
    currentSched = scheduleData
    if (currentSched.error == 'There are no schedules for this day.') {
      school = false;
    }

    if (school) {
      for(var i = 0; i < currentSched.length; i++) {

        var startTime = currentSched[i].start_seconds
        var tempStartHours  =  parseInt( startTime / 3600 ) % 24;
        if (tempStartHours >= 13) {
          var  startHours = tempStartHours - 12;
        } else {
          startHours = tempStartHours;
        }
        var startMinutes = parseInt( startTime / 60 ) % 60;
        var startResult = (startHours < 10 ? "0" + startHours : startHours) + ":" + (startMinutes < 10 ? "0" + startMinutes : startMinutes);
        var endTime = currentSched[i].end_seconds
        var tempEndHours  =  parseInt( endTime / 3600 ) % 24;

        if (tempEndHours >= 13) {
          var  endHours = tempEndHours - 12;
        } else {
          endHours = tempEndHours
        }
        var endMinutes = parseInt( endTime / 60 ) % 60;
        var endResult = (endHours < 10 ? "0" + endHours : endHours) + ":" + (endMinutes < 10 ? "0" + endMinutes : endMinutes);
        allClassTimes.push(startResult + " - " + endResult);

        var classOrder = currentSched[i].name
        allClassOrder.push(classOrder);
      }
      for(var i = 0; i < currentSched.length; i++) {
        lunchArray = currentSched[i].lunch

        if (lunchArray.length === 3) {

          lunchClass = currentSched[i]
          lunchClassPeriod = currentSched[i].name
          isLunch = true;
          var lunchClassArray = lunchClass.lunch;
          lunchPeriodName = lunchClass.name;

          originalLunchStart = lunchClass.start_seconds
          originalLunchEnd = lunchClass.end_seconds

          var originalLunchStartHours  =  parseInt( originalLunchStart / 3600 ) % 24;

          var originalLunchStartMinutes = parseInt( originalLunchStart / 60 ) % 60;
          var originalLunchStartResult = (originalLunchStartHours < 10 ? "0" + originalLunchStartHours : originalLunchStartHours) + ":" + (originalLunchStartMinutes < 10 ? "0" + originalLunchStartMinutes : originalLunchStartMinutes);

          var originalLunchEndHours =  parseInt( originalLunchEnd / 3600 ) % 24;

          var originalLunchEndMinutes = parseInt( originalLunchEnd / 60 ) % 60;
          var originalLunchEndResult = (originalLunchEndHours < 10 ? "0" + originalLunchEndHours : originalLunchEndHours) + ":" + (originalLunchEndMinutes < 10 ? "0" + originalLunchEndMinutes : originalLunchEndMinutes);

          var originalLunchFull = originalLunchStartResult + ' - ' + originalLunchEndResult
          var checked = true;
        }
        else if (lunchArray.length === 0 && checked == false){
          isLunch = false;
        }
      }



      if (isLunch) {

        var waveOne = lunchClassArray[0]
        waveOneStart = waveOne.start_seconds
        waveOneEnd = waveOne.end_seconds

        var waveOneStartHours  =  parseInt( waveOneStart / 3600 ) % 24;

        var waveOneStartMinutes = parseInt( waveOneStart / 60 ) % 60;
        waveOneStartResult = (waveOneStartHours < 10 ? "0" + waveOneStartHours : waveOneStartHours) + ":" + (waveOneStartMinutes < 10 ? "0" + waveOneStartMinutes : waveOneStartMinutes);

        var waveOneEndHours  =  parseInt( waveOneEnd / 3600 ) % 24;
        var waveOneEndMinutes = parseInt( waveOneEnd / 60 ) % 60;
        waveOneEndResult = (waveOneEndHours < 10 ? "0" + waveOneEndHours : waveOneEndHours) + ":" + (waveOneEndMinutes < 10 ? "0" + waveOneEndMinutes : waveOneEndMinutes);


        var waveTwo = lunchClassArray[1]
        waveTwoStart = waveTwo.start_seconds
        waveTwoEnd = waveTwo.end_seconds

        var waveTwoStartHours  =  parseInt( waveTwoStart / 3600 ) % 24;
        var waveTwoStartMinutes = parseInt( waveTwoStart / 60 ) % 60;
        waveTwoStartResult = (waveTwoStartHours < 10 ? "0" + waveTwoStartHours : waveTwoStartHours) + ":" + (waveTwoStartMinutes < 10 ? "0" + waveTwoStartMinutes : waveTwoStartMinutes);

        var waveTwoEndHours  =  parseInt( waveTwoEnd / 3600 ) % 24;
        var waveTwoEndMinutes = parseInt( waveTwoEnd / 60 ) % 60;
        waveTwoEndResult = (waveTwoEndHours < 10 ? "0" + waveTwoEndHours : waveTwoEndHours) + ":" + (waveTwoEndMinutes < 10 ? "0" + waveTwoEndMinutes : waveTwoEndMinutes);


        var waveThree = lunchClassArray[2]
        waveThreeStart = waveThree.start_seconds
        waveThreeEnd = waveThree.end_seconds

        var waveThreeStartHours  =  parseInt( waveThreeStart / 3600 ) % 24;
        var waveThreeStartMinutes = parseInt( waveThreeStart / 60 ) % 60;
        waveThreeStartResult = (waveThreeStartHours < 10 ? "0" + waveThreeStartHours : waveThreeStartHours) + ":" + (waveThreeStartMinutes < 10 ? "0" + waveThreeStartMinutes : waveThreeStartMinutes);

        var waveThreeEndHours  =  parseInt( waveThreeEnd / 3600 ) % 24;
        var waveThreeEndMinutes = parseInt( waveThreeEnd / 60 ) % 60;
        waveThreeEndResult = (waveThreeEndHours < 10 ? "0" + waveThreeEndHours : waveThreeEndHours) + ":" + (waveThreeEndMinutes < 10 ? "0" + waveThreeEndMinutes : waveThreeEndMinutes);

        lunchPeriodReplaced = allClassOrder.indexOf(lunchPeriodName)
        lunchTimeReplaced = allClassTimes.indexOf(originalLunchFull)

      }
    } else if (school == false) {
      allClassOrder = 'NO  SCHOOL'
      schoolOver = true;
    }
  }


  function timers () {
    schoolOver = false;
    lunchTime = false;
    if (school) {
      lastClass = currentSched[currentSched.length - 1];

      var previousClass = currentClass;
      currentClass = 'passing';
      for(var i = 0; i < currentSched.length; i++) {
        if (totalTimeWithOffset >= currentSched[i].start_seconds && totalTimeWithOffset <= currentSched[i].end_seconds) {
          //DETERMINES CURRENT CLASS - CURRENTCLASS FORMULA
          currentClass = currentSched[i]
          var nextClassPosition = currentSched.indexOf(currentClass) + 1
          nextClass = currentSched[nextClassPosition]

          startCurrentClassTime = currentClass.start_seconds
          endCurrentClassTime = currentClass.end_seconds

          if (currentClass.name == lastClass.name) {
            lastPeriod = true;
          }
        }
      }

      var firstClass = currentSched[0]
      if (isLunch) {

        if(currentClass !== lunchClassPeriod && passingTime == false ) {
          if (totalTimeWithOffset > lastClass.end_seconds || totalTimeWithOffset < firstClass.start_seconds && passingTime == false) {
            schoolOver = true;
            console.log("hi")
            timeLeftMinutes = undefined;
          }
        }
      }

      if (totalTimeWithOffset > lastClass.end_seconds || totalTimeWithOffset < firstClass.start_seconds && passingTime == false) {
        schoolOver = true;
        timeLeftMinutes = undefined;
      }
      // nextClass = currentSched[nextClassPosition]
      if (school && schoolOver == false) {
        //Passing Time
        passingTime = false;
        if (currentClass === undefined || currentClass == 'passing' || (currentClass.name === lunchClassPeriod && (totalTimeWithOffset > waveOneEnd && totalTimeWithOffset < waveTwoStart) || (totalTimeWithOffset > waveTwoEnd && totalTimeWithOffset < waveThreeStart)) && !schoolOver) {
          passingTime = true;
          currentClass = 'passing';
          for(var i = 0; i < currentSched.length; i++) {
            var nextClassPosition = currentSched.indexOf(currentSched[i]) + 1
            var nextClassTest = currentSched[nextClassPosition]
            if(lastClass.name != currentClass.name && nextClassTest !== undefined) {
              if (totalTimeWithOffset > currentSched[i].end_seconds && totalTimeWithOffset < nextClassTest.end_seconds) {
                nextClass = currentSched[nextClassPosition]
                startingClass = currentSched[i]
              }
            }
          }

          timeIn = totalTimeWithOffset - startingClass.end_seconds
          timeLeft = nextClass.start_seconds - totalTimeWithOffset

          timeInMinutes = Math.floor(timeIn / 60);
          timeInSeconds = timeIn - timeInMinutes * 60;

          timeLeftMinutes = Math.floor(timeLeft / 60);
          timeLeftSeconds = timeLeft - timeLeftMinutes * 60;

          if (timeLeftSeconds < 10) {
            timeLeftSeconds = '0' + timeLeftSeconds
          } else {
            timeLeftSeconds = timeLeftSeconds
          }

          if (timeInSeconds < 10) {
            timeInSeconds = '0' + timeInSeconds
          } else {
            timeInSeconds = timeInSeconds
          }

          if (timeLeftMinutes < 10) {
            timeLeftMinutes = '0' + timeLeftMinutes
          } else {
            timeLeftMinutes = timeLeftMinutes
          }

          if (timeInMinutes < 10) {
            timeInMinutes = '0' + timeInMinutes
          } else {
            timeInMinutes = timeInMinutes
          }

          //LUNCH PASSING TIMER

          if (currentClass.name === undefined && (totalTimeWithOffset > waveOneEnd && totalTimeWithOffset < waveTwoStart) || (totalTimeWithOffset > waveTwoEnd && totalTimeWithOffset < waveThreeStart)) {
            if (totalTimeWithOffset > waveOneEnd && totalTimeWithOffset < waveTwoStart) {
              timeIn = totalTimeWithOffset - waveOneEnd
              timeLeft = waveTwoStart - totalTimeWithOffset
              timeInMinutes = Math.floor(timeIn / 60);
              timeInSeconds = timeIn - timeInMinutes * 60;

              timeLeftMinutes = Math.floor(timeLeft / 60);
              timeLeftSeconds = timeLeft - timeLeftMinutes * 60;
              // nextClass

              if (timeInSeconds < 10) {
                timeInSeconds = '0' + timeInSeconds
              }
              if (timeLeftSeconds < 10) {
                timeLeftSeconds = '0' + timeLeftSeconds
              }
              if (timeInMinutes < 10) {
                timeInMinutes = '0' + timeInMinutes
              }
              if (timeLeftMinutes < 10) {
                timeLeftMinutes = '0' + timeLeftMinutes
              }
            }
            if (totalTimeWithOffset > waveTwoEnd && totalTimeWithOffset < waveThreeStart) {
              timeIn = totalTimeWithOffset - waveTwoEnd
              timeLeft = waveThreeStart - totalTimeWithOffset

              timeInMinutes = Math.floor(timeIn / 60);
              timeInSeconds = timeIn - timeInMinutes * 60;

              timeLeftMinutes = Math.floor(timeLeft / 60);
              timeLeftSeconds = timeLeft - timeLeftMinutes * 60;

              if (timeInSeconds < 10) {

                timeInSeconds = '0' + timeInSeconds
              }
              if (timeLeftSeconds < 10) {
                timeLeftSeconds = '0' + timeLeftSeconds
              }
              if (timeInMinutes < 10) {
                timeInMinutes = '0' + timeInMinutes
              }
              if (timeLeftMinutes < 10) {
                timeLeftMinutes = '0' + timeLeftMinutes
              }
            }
          }
        } else {


          timeIn = totalTimeWithOffset - startCurrentClassTime
          timeLeft = endCurrentClassTime - totalTimeWithOffset

          timeInMinutes = Math.floor(timeIn / 60);
          timeInSeconds = timeIn - timeInMinutes * 60;

          timeLeftMinutes = Math.floor(timeLeft / 60);
          timeLeftSeconds = timeLeft - timeLeftMinutes * 60;

          if (timeLeftSeconds < 10) {
            timeLeftSeconds = '0' + timeLeftSeconds
          } else {
            timeLeftSeconds = timeLeftSeconds
          }

          if (timeInSeconds < 10) {
            timeInSeconds = '0' + timeInSeconds
          } else {
            timeInSeconds = timeInSeconds
          }

          if (timeLeftMinutes < 10) {
            timeLeftMinutes = '0' + timeLeftMinutes
          } else {
            timeLeftMinutes = timeLeftMinutes
          }

          if (timeInMinutes < 10) {
            timeInMinutes = '0' + timeInMinutes
          } else {
            timeInMinutes = timeInMinutes
          }
        }
      }
      //LUNCH TIMER
      if (schoolOver == false) {
        if (currentClass.name == lunchClassPeriod ) {
          lunchTime = true;
          if (totalTimeWithOffset >= waveOneStart && totalTimeWithOffset <= waveOneEnd) {
            currentLunchPeriod = '1'
            endCurrentLunchPeriod = waveOneEnd;
            startCurrentLunchPeriod = waveOneStart;
            timeIn = totalTimeWithOffset - waveOneStart
            timeLeft = waveOneEnd - totalTimeWithOffset

            timeInMinutes = Math.floor(timeIn / 60);
            timeInSeconds = timeIn - timeInMinutes * 60;

            timeLeftMinutes = Math.floor(timeLeft / 60);
            timeLeftSeconds = timeLeft - timeLeftMinutes * 60;

            if (timeLeftSeconds < 10) {
              timeLeftSeconds = '0' + timeLeftSeconds
            } else {
              timeLeftSeconds = timeLeftSeconds
            }

            if (timeInSeconds < 10) {
              timeInSeconds = '0' + timeInSeconds
            } else {
              timeInSeconds = timeInSeconds
            }

            if (timeLeftMinutes < 10) {
              timeLeftMinutes = '0' + timeLeftMinutes
            } else {
              timeLeftMinutes = timeLeftMinutes
            }

            if (timeInMinutes < 10) {
              timeInMinutes = '0' + timeInMinutes
            } else {
              timeInMinutes = timeInMinutes
            }
          } else if (totalTimeWithOffset >= waveTwoStart && totalTimeWithOffset <= waveTwoEnd) {
            currentLunchPeriod = '2'
            endCurrentLunchPeriod = waveTwoEnd;
            startCurrentLunchPeriod = waveTwoStart;

            timeIn = totalTimeWithOffset - waveTwoStart
            timeLeft = waveTwoEnd - totalTimeWithOffset

            timeInMinutes = Math.floor(timeIn / 60);
            timeInSeconds = timeIn - timeInMinutes * 60;

            timeLeftMinutes = Math.floor(timeLeft / 60);
            timeLeftSeconds = timeLeft - timeLeftMinutes * 60;

            if (timeLeftSeconds < 10) {
              timeLeftSeconds = '0' + timeLeftSeconds
            } else {
              timeLeftSeconds = timeLeftSeconds
            }

            if (timeInSeconds < 10) {
              timeInSeconds = '0' + timeInSeconds
            } else {
              timeInSeconds = timeInSeconds
            }

            if (timeLeftMinutes < 10) {
              timeLeftMinutes = '0' + timeLeftMinutes
            } else {
              timeLeftMinutes = timeLeftMinutes
            }

            if (timeInMinutes < 10) {
              timeInMinutes = '0' + timeInMinutes
            } else {
              timeInMinutes = timeInMinutes
            }
          } else if (totalTimeWithOffset >= waveThreeStart && totalTimeWithOffset <= waveThreeEnd) {
            currentLunchPeriod = '3'
            endCurrentLunchPeriod = waveThreeEnd;
            startCurrentLunchPeriod = waveThreeStart;

            timeIn = totalTimeWithOffset - waveThreeStart
            timeLeft = waveThreeEnd - totalTimeWithOffset

            timeInMinutes = Math.floor(timeIn / 60);
            timeInSeconds = timeIn - timeInMinutes * 60;

            timeLeftMinutes = Math.floor(timeLeft / 60);
            timeLeftSeconds = timeLeft - timeLeftMinutes * 60;


            if (timeLeftSeconds < 10) {
              timeLeftSeconds = '0' + timeLeftSeconds
            } else {
              timeLeftSeconds = timeLeftSeconds
            }

            if (timeInSeconds < 10) {
              timeInSeconds = '0' + timeInSeconds
            } else {
              timeInSeconds = timeInSeconds
            }

            if (timeLeftMinutes < 10) {
              timeLeftMinutes = '0' + timeLeftMinutes
            } else {
              timeLeftMinutes = timeLeftMinutes
            }

            if (timeInMinutes < 10) {
              timeInMinutes = '0' + timeInMinutes
            } else {
              timeInMinutes = timeInMinutes
            }
          }
        }
      }
    }


  }


  function finalArrays () {
    if (isLunch) {
      allClassOrder.splice(lunchPeriodReplaced,1, + lunchPeriodName + "<div class = 'sub1'>L</div><div class = 'sub2'></div>")
      allClassTimes.splice(lunchTimeReplaced,1,'<span class = "firstWave">' +  waveOneStartResult + ' - ' + waveOneEndResult + '</span><br><span class = "secondWave">'  + waveTwoStartResult + ' - ' + waveTwoEndResult + '</span><br><span class = "thirdWave">' + waveThreeStartResult + ' - ' + waveThreeEndResult + "</span>'id = 'lunch");
    }
  }

  function sendSchedulesVariables() {
    chrome.runtime.sendMessage({'school' : school, 'allClassOrder' : allClassOrder, 'allClassTimes' : allClassTimes, 'schoolOver' : schoolOver, 'currentClass' : currentClass, 'passingTime' : passingTime, 'nextClass' : nextClass, 'schedule' : true, 'lunchClassPeriod' : lunchClassPeriod, 'currentLunchPeriod' : currentLunchPeriod})
  }

  function sendTimeVariables () {
    chrome.runtime.sendMessage({'timeInMinutes': timeInMinutes, 'timeInSeconds' : timeInSeconds, 'currentClass' : currentClass, 'school' : school, 'schoolOver' : schoolOver, 'passingTime' : passingTime, 'nextClass' : nextClass,'timeLeftMinutes' : timeLeftMinutes,'timeLeftSeconds' : timeLeftSeconds, 'time':true})
  }

  function sendExtra() {
    chrome.runtime.sendMessage({'ready':true,'day':day,'today':today,'realTime':realTime,'timeOfDay':timeOfDay})
  }

  var checkOpen
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.open === true) {
        $(document).ajaxError(function() {
          chrome.runtime.sendMessage({'offline' : true})
        })

        sendSchedulesVariables();
        sendTimeVariables();
        sendExtra();

        setInterval(sendSchedulesVariables,1000*60*15)
        setInterval(sendTimeVariables,500)
        setInterval(sendExtra,500)

      }
    }
  );


  var secondsPassed;
  var notificationSentTime = 0;
  function createNotification() {
    var timeOfClass = (endCurrentClassTime - startCurrentClassTime) / 60;
    var timeOfClassLunch = (endCurrentLunchPeriod - startCurrentLunchPeriod) / 60;
    var timeInNotif = timeIn / 60
    var progressLunch = Math.round(timeInNotif / timeOfClassLunch *100)
    chrome.storage.sync.get(null, function(items) {
      var notificationTimeWanted = items.notificationTimeWanted
      var sound = items.sound

      var notificationTime = endCurrentClassTime - notificationTimeWanted;
      // var notificationTime = 62620;
      var notificationTimeLunch = endCurrentLunchPeriod - notificationTimeWanted;
      secondsPassed = totalTimeWithOffset - notificationSentTime

      var isAre;
      var minutePlural;
      var lunchOrClass;
      var end;
      var lunchNameOrClassName;

      if(school && !schoolOver) {
        if (notificationTimeWanted > 60) {
          isAre = 'are'
          minutePlural = 'minutes'
        } else {
          isAre = 'is'
          minutePlural = 'minute'
        }

        if (lunchTime) {
          lunchOrClass = 'lunch wave'
          lunchNameOrClassName = currentLunchPeriod;
          notificationTime = endCurrentLunchPeriod - notificationTimeWanted;
          progress= Math.round(timeInNotif / timeOfClassLunch *100)

        } else {
          lunchOrClass = 'period'
          lunchNameOrClassName = currentClass.name
          progress = Math.round(timeInNotif / timeOfClass *100)

        }
        if (lastPeriod) {
          end = 'School is almost over!'
        } else if (lunchTime) {
          end = ''
        } else{
          end = 'Next period is period ' + nextClass.name + '.'
        }

        if (parseInt(timeLeftMinutes) < 10) {
          timeLeftNotificationText = parseInt(timeLeftMinutes.substring(1))
        } else {
          timeLeftNotificationText = timeLeftMinutes
        }

      }





      if(notificationTime === totalTimeWithOffset && secondsPassed > 10) {
        chrome.notifications.create ({
          type: "progress",
          title: timeLeftNotificationText + ' ' + minutePlural +  ' left!',
          message: "There " + isAre + ' ' + timeLeftNotificationText + ' ' + minutePlural + ' left in ' + lunchOrClass + ' ' + lunchNameOrClassName + '. ' + end,
          iconUrl: "/images/128.png",
          progress: progress
        });
        if (sound === true) {
          audio.play();
        }
        notificationSentTime = totalTimeWithOffset;
      }
    }
  )};

  var timeLeftBadgeText;

  setInterval(function(){
    if (timeLeftMinutes !== undefined) {
      if (timeLeftSeconds > 30  && timeLeftMinutes >= 10) {

        timeLeftBadgeText = timeLeftMinutes + 1
      } else if (timeLeftSeconds < 30 && timeLeftMinutes >= 10) {
        timeLeftBadgeText = timeLeftMinutes
      }

      if (timeLeftMinutes < 10 && timeLeftSeconds > 30) {
        timeLeftBadgeText = parseInt(timeLeftMinutes.substring(1)) + 1
      } else if (timeLeftMinutes < 10 && timeLeftSeconds < 30) {
        timeLeftBadgeText = parseInt(timeLeftMinutes.substring(1))
      }

      if (timeLeftMinutes == 0) {
        timeLeftBadgeText = timeLeftSeconds;
      }

      if (timeLeftMinutes > 100) {
        timeLeftBadgeText = '1hr+'
      }
      if (timeLeftMinutes > 0) {
        chrome.browserAction.setBadgeText({text: timeLeftBadgeText + "m"})
      } else {
        chrome.browserAction.setBadgeText({text: timeLeftBadgeText + "s"})

      }
    } else {
      chrome.browserAction.setBadgeText({text:  ''})

    }

  },500)

  var listening = false;
  var hasKeys;
  var consumerKey;
  var consumerSecret;
  var firstBlock = false;
  var allAssignments = [];

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (sender.tab !== undefined) {

        if (sender.tab.title == 'Settings') {
          listening = true;
          link = "http://schoology.westport.k12.ct.us/"
          window.open(link);
        }
      }
      if (listening == true && sender.tab.title == 'Home | Schoology') {
        // alert(listening)
        listening = false;
        // //alert('In the listening if block 2')
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {readyFromJS: "Ready"});
        });
      } else if (sender.tab !== undefined){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {readyFromJS: "Not Ready"});
        });
      }
      if (request.consumerKey !== null && request.consumerKey !== undefined) {
        chrome.storage.sync.set({'consumerKey': request.consumerKey, 'consumerSecret' : request.consumerSecret, 'hasKeys' : 'YES'}, function() {
          // Notify that we saved.
        });
      }

    }
  );


  setInterval(function(){

    $.ajax({
      method: 'get',
      url: "https://shsschedule.herokuapp.com/push",
      jsonp:false,
      success: callNotifAJax
    });

    //reload


  },1000*60)

  function callNotifAJax (data) {
    var newVersion = data.version

    var message = data.message
    var title = data.title

    if (newVersion == 0) {
      chrome.runtime.reload();
    }
    chrome.storage.sync.get(null,function(item){
      setVersion = item.version
      if (setVersion < newVersion) {
        chrome.notifications.create ({
          type: "basic",
          title: title,
          message: message,
          iconUrl: "/images/128.png",
        });
        chrome.storage.sync.set({"version" : newVersion})
      }
    })

  }


  //HANDLE OFFLINE CONNECTION

  $(document).ajaxError(function() {
    console.log("Offline.")

    setInterval(function() {
      chrome.runtime.reload()
    }, 1000*30);}

  );



  //reload daily

  setInterval(function() {
    var fullDate = new Date();
    var todaysDate = fullDate.getDate();

    chrome.storage.sync.get(null,function(item){
      storedDate = item.date

      if (storedDate === undefined || storedDate !== todaysDate) {
        chrome.storage.sync.set({"date" : todaysDate})
        retrieveAJAX();
      }

    })


  },1000*60);

  var _AnalyticsCode = 'UA-86407709-1';

  var _gaq = _gaq || [];
   _gaq.push(['_setAccount', 'UA-86407709-1']);
   _gaq.push(['_trackPageview']);

   (function() {
     var ga = document.createElement('script');
     ga.type = 'text/javascript';
     ga.async = true;
     ga.src = 'https://ssl.google-analytics.com/ga.js';
     var s = document.getElementsByTagName('script')[0];
     s.parentNode.insertBefore(ga, s);
   })();

   _gaq.push(['_trackPageview']);

   (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://ssl.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-86407709-1', 'auto');
  ga('send', 'pageview');
