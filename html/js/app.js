// Copyright (Jack Sharkey) 2016 Copyright Holder All Rights Reserved.
var allClassOrder;
var allClassTimes;
var timeInMinutes;
var timeInSeconds;
var timeLeftMinutes;
var timeLeftSeconds;
var schoolOver;
var currentClass;
var realTime;
var today;
var day;
var timeOfDay;
var userId;
var nextClass;
var school;
var passingTime;
var audio;
var scheduleNames = ['','','','','','','','','',''];
var periodNumberAndName;
var classLunchWave;



chrome.storage.sync.set({'opened' : true})


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.offline) {
      console.log(request.offline)
      wentOffline = true;
      chrome.storage.sync.set({'wentOffline' : wentOffline})
      $('.toprow').hide();
      $('.middlerow').hide();
      $('.labels').hide();
      $('.loader').html("Failed to connect to server. Please check connection and try again.")
      $('.dimmerFull').dimmer('show')


    }
  }
)

chrome.storage.sync.get(null, function(item){
  if (item.wentOffline) {
    chrome.runtime.reload()
  }
})



setTimeout(function(){
  audio  = new Audio('/bell.mp3')
},1000)


$('.dimmerFull')
.dimmer({
  blurring: true,
  closable: false

})
.dimmer('show');

retriveVariables();
function retriveVariables() {
  chrome.runtime.sendMessage({open:true })
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.schedule) {
        school = request.school
        allClassOrder = request.allClassOrder
        allClassTimes = request.allClassTimes
        schoolOver = request.schoolOver
        currentClass = request.currentClass
        passingTime = request.passingTime
        nextClass = request.nextClass
        lunchClassPeriod = request.lunchClassPeriod
        currentLunchPeriod = request.currentLunchPeriod
        addSchedule();
      }
      if (request.time) {

        timeInMinutes = request.timeInMinutes
        timeInSeconds = request.timeInSeconds
        timeLeftMinutes = request.timeLeftMinutes
        timeLeftSeconds = request.timeLeftSeconds
        school = request.school
        schoolOver = request.schoolOver
        currentClass = request.currentClass
        passingTime = request.passingTime
        nextClass = request.nextClass
        changeTimer();
      }

      if (request.ready) {
        day = request.day
        today = request.today
        realTime = request.realTime
        timeOfDay = request.timeOfDay
        changeDate();
        changeTimes();
        // setInterval(changeTimes,500)
      }
    }

  )
}


window.onbeforeunload = function(){
  var open = false;
  chrome.runtime.sendMessage({open:false })
}




function addSchedule() {
  if (school) {
    $(".schedule").html("");


    for(var i = 0; i < allClassOrder.length; i++) {

      // if (scheduleNames.indexOf('') !== 0) {
      //   var newClass = $("<div class = 'updatedSched' data-variation='tiny' data-html ='<span>" +  scheduleNames[i] + '</span><br>' + allClassTimes[i] + "'>" +
      //   '<div class ="' + allClassOrder[i] + '">'  +
      //   allClassOrder[i] +
      //   '</div>'  +
      //   "</div>");
      // } else {
        var newClass = $("<div class = 'updatedSched' data-variation='tiny' data-html ='" +  allClassTimes[i] + "'>" +
        '<div>' +
        allClassOrder[i] +
        '</div>'  +
        "</div>");
      // }

      newClass.popup({
        position : 'left center',
        transition: 'horizontal flip'
      });

      if (schoolOver == false || school === false) {
        if (allClassOrder[i] == currentClass.name || currentClass.name + "<div class = 'sub1'>L</div><div class = 'sub2'></div>" === allClassOrder[i]) {
          newClass.css("color", "#336699")
        }

        //(passingTime)
        //(nextClass.name + '<div class = "sub">L</sub>')
        //(allClassOrder[i])
        if (passingTime && (nextClass.name === allClassOrder[i] || nextClass.name + "<div class = 'sub1'>L</div><div class = 'sub2'></div>" === allClassOrder[i])) {
          newClass.css("color", 'green')
        }
      }

      $(".schedule").append(newClass);
    }
  } else if (school == false) {
    $(".schedule").html("");
    for(var i = 0; i < allClassOrder.length; i++) {
      var newClass = $("<div class = 'updatedSched'>" +
      '<div class ="' + allClassOrder[i] + '">'  +
      allClassOrder[i] +
      '</div>'  +
      "</div>");
      $(".schedule").append(newClass);
    }

  }

  //determine font size - FONTSIZE FORMULA
  var totalClasses = allClassOrder.length
  var heightBox = $('.schedule').height();

  var totalObjectsHeight = (heightBox / totalClasses) * 0.8;
  if (totalObjectsHeight > 100) {
    totalObjectsHeight = 60;
  }

  $('.updatedSched').css('font-size', totalObjectsHeight);

  $('#lunch').click(function(){
    var newURL = "http://shs.westportps.org/uploaded/site_files/shs/main_office/Lunch_Schedule_17-18.pdf";
    chrome.tabs.create({ url: newURL });
  });

  if(school) {
    $('div.updatedSched').click(function() {
      var clickedPeriodName = $(this).text()
      var popup = $(this)
      // showAllClassAssignments(clickedPeriodName, popup);
    })

  } else {
    $('.updatedSched').css("cursor", 'defaultburr')
  }


  if (classLunchWave === 1) {
    $('.sub2').html('(1)')
  }
  if (classLunchWave === 2) {
    $('.sub2').html('(2)')
  }
  if (classLunchWave === 3) {
    $('.sub2').html('(3)')
  }
  if (classLunchWave === "F") {
    $('.sub2').html('(F)')
  }


}
var refreshed = false;

function changeTimer() {
  if (schoolOver == false && school) {

    $('#start').html('Time in: ' + timeInMinutes + ":" + timeInSeconds)
    $('#end').html('Time left: ' + timeLeftMinutes + ":" + timeLeftSeconds)
  } else {
    $('#start').html("-")
    $('#end').html("-")
  }

  if (currentClass === 'passing' && refreshed === false) {
    addSchedule();
    refreshed = true;
  } else if (currentClass !== 'passing') {
    refreshed = false;
  }

  if (school && !schoolOver) {
    if (currentClass.name === lunchClassPeriod) {
      $('.sub1').html(currentLunchPeriod)
    } else {
      $('.sub1').html('L')

    }
  }
}

function changeTimes() {
  $('.time').html(realTime + ' ' + timeOfDay)
}

function changeDate() {
  if (!different) {
    $('.date').html(day + ' ' + today);

  } else {
    $('.date').html(day2 + ' ' + date2);

  }
}

var days = 0;
$('.leftButton').click(function(){
  days -= 1
  getNewDate();
});

$('.rightButton').click(function(){
  days += 1;
  getNewDate();
});

var date2;
var day2;

function getNewDate() {
  var d1 = Date.today().add(days).days()
  day2 = d1.getDayName()

  date = d1.getDate()
  date2 = d1.toString('MM/dd')


  // var d1 = date.parse();
  d1 = d1.toString('yyyyMMdd');


  var link = 'https://shsschedule.herokuapp.com/schedule/' + d1
  $.ajax({
    // url: "http://shstv.herokuapp.com/api/schedule/2016/12/01",
    url: link,
    method: 'GET',
    success: function(data){
      if (typeof data == "object") {
        scheduleData = data;

      } else {
        scheduleData = JSON.parse(data)

      }

      currentSched = scheduleData
      console.log(currentSched)
      if (currentSched.error == 'There are no schedules for this day.') {
        school = false;
      } else {
        school = true;
      }
      schoolOver = true;
      
        allClassOrder = []
        allClassTimes = []
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
        isLunch = false;
      }

      if (isLunch) {
        allClassOrder.splice(lunchPeriodReplaced,1, + lunchPeriodName + "<div class = 'sub1'>L</div><div class = 'sub2'></div>")
        allClassTimes.splice(lunchTimeReplaced,1,'<span class = "firstWave">' +  waveOneStartResult + ' - ' + waveOneEndResult + '</span><br><span class = "secondWave">'  + waveTwoStartResult + ' - ' + waveTwoEndResult + '</span><br><span class = "thirdWave">' + waveThreeStartResult + ' - ' + waveThreeEndResult + "</span>'id = 'lunch");
      }


      
      addSchedule()
      periodNumberAndName = []
      scheduleNames = []
      different = true;
      
    },
  })

  //send message to background

}

var different = false;

//******************************************SCHOOLOGY BREAK****************************************
function getFormattedDate(monthOffset) {
  var today = new Date();

  if (monthOffset === undefined || monthOffset === 0) {
    monthOffset = 0;
    return(today.getFullYear() + '' + ('0' + (today.getMonth() + 1 + monthOffset)).slice(-2) + '' + ('0' + (today.getDate() )).slice(-2));
  } else if (today.getMonth() !== 11) {
    return(today.getFullYear() + '' + ('0' + (today.getMonth() + 1 + monthOffset)).slice(-2) + '' + ('0' + (today.getDate() )).slice(-2));


} else {
  return((today.getFullYear() + 1) + '' + ('01' + ('0' + (today.getDate() )).slice(-2)));
}
}





chrome.storage.sync.get(null, function(items) {
  hasKeys = items.hasKeys
  consumerKey = items.consumerKey
  consumerSecret = items.consumerSecret

  if (hasKeys === 'YES') {
    $('.noAssignments').css('display', 'none')
    $('.dimmerNoKeys').dimmer('hide all')
    options = {
      enablePrivilege : false,
      consumerKey : consumerKey,
      consumerSecret : consumerSecret
    };
    oauth = OAuth(options);

    retrieveEvents();
  } else {
    $('.assignments').css('display', 'none')
    $(".dimmerFull").dimmer("hide")
    $('.dimmerNoKeys')
    .dimmer({
      blurring: true,
      closable: false
    })
    .dimmer('show');

  }
});


  var courses;





  function retrieveEvents() {
    allAssignments = [];
    var yyyymmdd = getFormattedDate();
    oauth.get('https://api.schoology.com/v1/app-user-info', function (data) {

      userId  = JSON.parse(data.text).api_uid
      var eventsLink = 'https://api.schoology.com/v1/users/' + userId + '/events/?start_date=' + getFormattedDate() + '&end_date=' + getFormattedDate(1);
      courses = 'https://api.schoology.com/v1/users/' + userId + '/sections'
      var eventsLink2 = 'https://api.schoology.com/v1/users/' + userId + '/events/'
      
      oauth.get(eventsLink, function(data) {
        var eventTitles = JSON.parse(data.text)
        // console.log(eventTitles)

        for(var i = 0; i < eventTitles.event.length; i++) {
          var year = eventTitles.event[i].start.substring(0,4)
          if (eventTitles.event[i].start.substring(5,6) == 0 ) {
            var month = eventTitles.event[i].start.substring(6,7)
          } else {
            var month = eventTitles.event[i].start.substring(5,7)
          }
          var day = eventTitles.event[i].start.substring(8,10)
          var fullDate = month + '/' + day
          if(eventTitles.event[i].title == "A") {
            var id = eventTitles.event[i].id
            console.log(id)
          }

          var title = eventTitles.event[i].title

          if ((title !== "B") && (title !== "C") && (title !== "A") && (title !== "D") && (title !== "X") && (title !== "D*") && (title !== "MIDTERM") && (title !== "FINAL")) {
            // if (title !== "A") {
              
            console.log(title)
            
            allAssignments.push({title: eventTitles.event[i].title, date: fullDate, description: eventTitles.event[i].description, section_id: eventTitles.event[i].section_id, type: eventTitles.event[i].type})
            
          }
        }
        attachData();
      });
      
        
      // $.getJSON("js/json/rotation.json", function(json) {
      //   var length = (Object.keys(json).length)
      //   for (i = 0; i < json.length; i++) {
      //     var date = json[i].DATE
      //     var title = json[i].TYPE

      //     var year = date.substring(0,4)
      //     var month = date.substring (4,6)
      //     var day = date.substring(6,8)
      //     var fullDateStringStart = year + "-" + month + "-" + day + " 00:00:00"
      //     var fullDateStringEnd = year + "-" + month + "-" + day + " 23:59:59"
          
      //     console.log('before');
      //     wait(2000);  //7 seconds in milliseconds
      //     console.log('after');

      //     oauth.postJSON(eventsLink2, {
      //         'title' : title,
      //         'start' : fullDateStringStart,
      //         'end' : fullDateStringEnd
      //       })

      //     // console.log(date + ' ' + type)
      //   }          
      //   console.log("done")
      // })        

    // oauth.postJSON(eventsLink2, {
    //   'title' : "testing from comp sci",
    //   'start' : '2017-09-23 12:00:00'
    // })
      
      

      

 
     
      oauth.get(courses,function(data){
        sections = JSON.parse(data.text)
        periodNumberAndName = []


        for (var i = 0; i < sections.section.length; i++) {
          var fullSection = sections.section[i].section_title
          var period = fullSection.substring(10,11)
          var courseName = sections.section[i].course_title

          periodNumberAndName.push({period: period, courseName: courseName, fullSection: sections.section[i].id})

        }


        // addCourseTitles(periodNumberAndName);


      })
    });

  }

 

  var sections;
  function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }
  function attachData() {

    day = ''
    if (allAssignments.length === 0) {
      $('.noAssigmentText').css("display", "block")
    } else {
      for(var i = 0; i < allAssignments.length; i++) {
        day = Date.parse(allAssignments[i].date).getDayName()
        if (i === 0 || allAssignments[i-1].date !== allAssignments[i].date && allAssignments[i].date !== "Add Assignment") {
          var newDate = $("<div class = 'assignmentDate'>" + day + ' ' + allAssignments[i].date + "</div>");
          $('.assignments').append(newDate)
        } else if (allAssignments[i].date == "Add Assignment") {
          var newDate = $("<div class = 'assignmentDate'>" + allAssignments[i].date + "</div>");
          $('.assignments').append(newDate)
        }
        var newAssignment = $("<div class = 'title'>" + allAssignments[i].title + "</div>")
        $('.assignments').append(newAssignment)

      }
      // var add = allAssignments[allAssignments.length - 1];

    }
    $('.dimmerFull').dimmer('hide');


    $( ".title" ).click(function(e) {
      $('.dimmerFull').dimmer('show');

      var place = ''
      //find element
      var txt = $(e.target).text();
      var arrayTitles = []
      for (var i = 0; i < allAssignments.length; i++) {
        var name = allAssignments[i].title
        arrayTitles.push(name)
      }

      place = arrayTitles.indexOf(txt)

      var specificID = allAssignments[place].section_id

      //get class name


      oauth.get(courses, function(data){

        sections = JSON.parse(data.text)


        for (var i = 0; i < sections.section.length; i++) {

          var nonSpecificID = sections.section[i].id

          if (nonSpecificID == specificID) {
            var specificClass = sections.section[i].course_title


          }


        }




        //write modal

        if (specificClass == undefined) {
          specificClass = "Custom Event"
        }

        if (allAssignments[place].description == '' ) {
          description = $('<div class = "header">' +  txt + '</div><div class = "assignmentName">' + specificClass + '</div><div class = "ui divider"></div><div class="description">No description for this assignment.</div>');


        }  else  {
          description = $('<div class = "header">' + txt + '</div><div class = "assignmentName">' + specificClass + '</div><div class = "ui divider"></div><div class="description">' + allAssignments[place].description + '</div>');

        }

        $('.dimmerSchool').html(description)

        $('.dimmerFull').dimmer('hide');

        $('.dimmerSchool')
        .dimmer({
          blurring: true
        })
        .dimmer('show');

      });

    })


    $( ".dimmer" ).click(function(e) {
      $('.dimmerSchool')
      .dimmer('hide');

    });

  }




$('.optionsGo').click(function(){
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
})


function addCourseTitles(periodNumberAndName) {
  scheduleNames = []
  var tempPeriods = [];
  var lunchPeriodFull;
  for (var i =0; i < periodNumberAndName.length; i++) {
    tempPeriods.push(periodNumberAndName[i].period)
    if (periodNumberAndName[i].period == lunchClassPeriod) {
      lunchPeriodFull = periodNumberAndName[i]

    }
  }
  for (var j =0; j < allClassOrder.length; j++) {
    var location = tempPeriods.indexOf(allClassOrder[j])
    if (location === -1) {
      var tempLunchPeriod = allClassOrder[j].substring(0,1)
      location = tempPeriods.indexOf(tempLunchPeriod)
      if (tempPeriods.indexOf(tempLunchPeriod) !== -1) {
        var periodName = periodNumberAndName[location].courseName
      } else if (allClassOrder[j] === 'P') {
        var periodName = 'PEP RALLY'
      } else if (allClassOrder[j] === 'H') {
        var periodName = 'HOMEROOM'
      } else if (allClassOrder[j] === 'O') {
        var periodName = 'OTHER'
      } else if (allClassOrder[j] === 'T') {
      var periodName = 'TESTING'
      } else {
        var periodName = 'FREE'
      }
      location = tempPeriods.indexOf(tempLunchPeriod)
    } else {
      var periodName = periodNumberAndName[location].courseName


    }
    scheduleNames.push(periodName);




  }
  //get lunch stuff
  // classLunchWave = stuff[currentMonth]
  var department;
  $.getJSON("js/json/classes.json", function(json) {

    // console.log(lunchPeriodFull)
    if(lunchPeriodFull === undefined) {
      var temp = "FREE";
      lunchPeriodFull = {"courseName" : "FREE"}
    } else {
      var temp = lunchPeriodFull.courseName
      temp = temp.replace(/\s+/g, '');
    }
    for (i = 0; i < json.length; i++) {
      // console.log(json)
      // if (json[i].class == lunchPeriodFull.courseName) {
      if (json[i].class == temp ) {

        // console.log(json[i].department);
        department = json[i].department
      }
    }
  });
  $.getJSON("js/json/waves.json", function(json) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //
    var d = new Date();
    var tempCurrentMonth = monthNames[d.getMonth()]
    var currentMonth = tempCurrentMonth.substring(0,3) // Returns "Nov" (no spaces)
    for (i = 0; i < json.length; i++) {
      if (json[i].department == department) {
        // console.log(json[i][currentMonth]);
        classLunchWave = json[i][currentMonth]
        changeLunch(classLunchWave);

      }
    }
  });


  addSchedule()

}

function changeLunch(classLunchWave) {
  $('.sub1').html(classLunchWave)
  addSchedule()
}

function showAllClassAssignments(clickedPeriodName, popup) {
  var period = clickedPeriodName
  if (period.substring(1,2) == "L" || period.substring(1,2) == "1" || period.substring(1,2) == "2" || period.substring(1,2) == "3") {
    period = period.substring(0,1);
  }
  var localPeriodNameWithNumber = [];
  var assignments = []

  for (i = 0; i < allClassOrder.length; i++) {
    if (allClassOrder[i].substring(2,5) == "div"){
      allClassOrder[i] = allClassOrder[i].substring(0,1)
    }
    localPeriodNameWithNumber.push({period : allClassOrder[i], name : scheduleNames[i]})
  }



  var place = allClassOrder.indexOf(period)

  var className = localPeriodNameWithNumber[place].name

  for (i = 0; i < periodNumberAndName.length; i++) {
    var temp = periodNumberAndName[i].courseName

    if (temp == className) {
      var place2 = i;
    }

  }

  if (periodNumberAndName[place2] !== undefined) {



    var sectionID = periodNumberAndName[place2].fullSection


    var contains = false;


    //retrieve all events for corresponding period
    for(var i = 0; i < allAssignments.length; i++) {
      if (allAssignments[i].section_id == sectionID) {
        assignments.push(allAssignments[i])
        contains = true;
      }
    }

    if (!contains) {
      assignments[0] = {className : className, title: "No assignments!", description : " ", date: ""}

    }
  } else {
    assignments[0] = {className : "Free", title: "No assignments!", description : " ", date: ""}

  }
  //display
  var descriptionArray = []
  var totalAssignments = []

  className = $('<div class = "header">' + className + '</div>')

  for (var p = 0; p < assignments.length; p++){

    if (assignments[p].description == '' ) {
      // className = $('<div class = "header">' +  className + '</div>')
      assignment = $('<div class = "assignmentName2">' + assignments[p].title + '</div><div class="dateAll">' + assignments[p].date + '</div><div class="description2">No description for this assignment.</div><div class = "ui divider">');

    }  else  {
      // className = $('<div class = "header">' + className + '</div>')

      assignment = $('<div class = "assignmentName2">' + assignments[p].title + '</div><div class="dateAll">' + assignments[p].date + '</div><div class="description2">' + assignments[p].description + '</div><div class = "ui divider">');
    }
    descriptionArray.push(assignment)
    totalAssignments.push(className)

  }


  for (var k = 0; k < descriptionArray.length; k++) {
    totalAssignments.push(descriptionArray[k])
  }

  $('.dimmerSchool').html(totalAssignments)
  popup.popup('hide')

  $('.dimmerFull').dimmer('hide');

  $('.dimmerSchool')
  .dimmer({
    blurring: true
  })
  .dimmer('show');


  $( ".dimmer" ).click(function(e) {
    $('.dimmerSchool')
    .dimmer('hide');

  });
}
