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
var periodNumberAndName;
//
// var config = {
//   apiKey: "AIzaSyA2ZyG13I6qorKu7T9e5fqAs8sj-7KAm_o",
//   authDomain: "shsschedule-3af18.firebaseapp.com",
//   databaseURL: "https://shsschedule-3af18.firebaseio.com",
//   storageBucket: "shsschedule-3af18.appspot.com",
//   messagingSenderId: "380362637355"
// };
// firebase.initializeApp(config);


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
        setInterval(changeTimes,500)
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

      if (scheduleNames.indexOf('') !== 0) {
        var newClass = $("<div class = 'updatedSched' data-variation='tiny' data-html ='<span>" +  scheduleNames[i] + '</span><br>' + allClassTimes[i] + "'>" +
        '<div class ="' + allClassOrder[i] + '">'  +
        allClassOrder[i] +
        '</div>'  +
        "</div>");
      } else {
        var newClass = $("<div class = 'updatedSched' data-variation='tiny' data-html ='" +  allClassTimes[i] + "'>" +
        '<div>' +
        allClassOrder[i] +
        '</div>'  +
        "</div>");
      }

      newClass.popup({
        position : 'left center',
        transition: 'horizontal flip'
      });

      if (schoolOver == false || school === false) {
        if (allClassOrder[i] == currentClass.name || currentClass.name + "<div class = 'sub'>L</sub>" === allClassOrder[i]) {
          newClass.css("color", "#336699")
        }

        //(passingTime)
        //(nextClass.name + '<div class = "sub">L</sub>')
        //(allClassOrder[i])
        if (passingTime && (nextClass.name === allClassOrder[i] || nextClass.name + "<div class = 'sub'>L</sub>" === allClassOrder[i])) {
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

  // $('#lunch').click(function(){
  //   var newURL = "http://shs.westport.k12.ct.us/uploaded/site_files/shs/main_office/Lunch_Schedule_16-17.pdf";
  //   chrome.tabs.create({ url: newURL });
  // });

  if(school) {
    $('div.updatedSched').click(function() {
      var clickedPeriodName = $(this).text()
      var popup = $(this)
      showAllClassAssignments(clickedPeriodName, popup);
    })

  } else {
    $('.updatedSched').css("cursor", 'defaultburr')
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
      $('.sub').html(currentLunchPeriod)
    } else {
      $('.sub').html('L')

    }
  }
}

function changeTimes() {
  $('.time').html(realTime + ' ' + timeOfDay)
}

function changeDate() {
  $('.date').html(day + ' ' + today);
}




//******************************************SCHOOLOGY BREAK****************************************
function getFormattedDate(monthOffset) {
  if (monthOffset === undefined) {
    monthOffset = 0;
  }
  var today = new Date();
  return(today.getFullYear() + '' + ('0' + (today.getMonth() + 1 + monthOffset)).slice(-2) + '' + ('0' + (today.getDate() )).slice(-2));
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


  var courses;





  function retrieveEvents() {
    allAssignments = [];
    var yyyymmdd = getFormattedDate();
    oauth.get('https://api.schoology.com/v1/app-user-info', function (data) {

      userId  = JSON.parse(data.text).api_uid
      var eventsLink = 'https://api.schoology.com/v1/users/' + userId + '/events/?start_date=' + getFormattedDate() + '&end_date=' + getFormattedDate(1);
      courses = 'https://api.schoology.com/v1/users/' + userId + '/sections'
      oauth.get(eventsLink, function(data) {
        var eventTitles = JSON.parse(data.text)

        for(var i = 0; i < eventTitles.event.length; i++) {
          var year = eventTitles.event[i].start.substring(0,4)
          if (eventTitles.event[i].start.substring(5,6) == 0 ) {
            var month = eventTitles.event[i].start.substring(6,7)
          } else {
            var month = eventTitles.event[i].start.substring(5,7)
          }
          var day = eventTitles.event[i].start.substring(8,10)
          var fullDate = month + '/' + day
          allAssignments.push({title: eventTitles.event[i].title, date: fullDate, description: eventTitles.event[i].description, section_id: eventTitles.event[i].section_id, type: eventTitles.event[i].type})
        }
        attachData();
      });
      oauth.get(courses,function(data){
        sections = JSON.parse(data.text)
        periodNumberAndName = []


        for (var i = 0; i < sections.section.length; i++) {

          var fullSection = sections.section[i].section_title
          var period = fullSection.substring(10,11)
          var courseName = sections.section[i].course_title

          periodNumberAndName.push({period: period, courseName: courseName, fullSection: sections.section[i].id})

        }


        addCourseTitles(periodNumberAndName);


      })
    });

  }

  var sections;

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

});



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
      } else {
        var periodName = 'FREE'
      }
      location = tempPeriods.indexOf(tempLunchPeriod)
    } else {
      var periodName = periodNumberAndName[location].courseName


    }
    scheduleNames.push(periodName);




  }


  addSchedule()

}


function showAllClassAssignments(clickedPeriodName, popup) {
  var period = clickedPeriodName
  if (period.substring(1,2) == "L") {
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
    console.log(assignments)

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
      // console.log(assignment[p])
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
