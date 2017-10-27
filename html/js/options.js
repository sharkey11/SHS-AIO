var state;
var sound;



chrome.storage.sync.get(null, function(items) {
  consumerKey = items.consumerKey
  consumerSecret = items.consumerSecret

  $("#consumer").val(consumerKey)
  $("#secret").val(consumerSecret)


  if ($("#consumer").val() !== '') {
    $('.allow').html('Access granted. Click to grant access again.')
  }

});




$('.allow').click(function(){
  chrome.runtime.sendMessage({readyFromOptions:'ready'})
})

$('.bug').click(function(){
      var emailUrl = "mailto:sharkeyjack11@gmail.com?subject=Report Bug";
      chrome.tabs.create({ url: emailUrl }, function(tab) {
          setTimeOut(function() {
              chrome.tabs.remove(tab.id);
          }, 500);
      });
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.contentIsDone === 'ready') {
      location.reload();
    }
  });

  $('.test').click(function(){
    chrome.notifications.create ({
      type: "basic",
      title:   'Sample - 5 minutes left!',
      message: "There are 5 minutes left in period 1. Next period is period 2.",
      iconUrl: "/images/128.png"
      // progress: 80
    });
    audio.play();
  })

  $('.ui.dropdown')
  .dropdown()
  ;

  var time;

  $('.dropdown').dropdown({
    direction : 'upward',
    keepOnScreen : false,
    onChange: function(value, text, $choice) {
      time = value * 60
      chrome.storage.sync.set({'notificationTimeWanted': time, 'textHTML' : text})
    }
  })

  chrome.storage.sync.get(null, function(items) {
    textHTML = items.textHTML
    state = items.state
    sound = items.sound

    $('.minutesText').html(textHTML)
    if  (state === false) {
      $('#dropdown').addClass("disabled")
      $('#enabled').html('Disabled')
      $('.divider').addClass("disabled")
      $('.sound').checkbox('set disabled')
      $('.notificationsCheck').checkbox('uncheck');


    }
    if  (state === true) {
      $('#dropdown').removeClass("disabled")
      $('#enabled').removeClass("disabled")
      $('.divider').removeClass("disabled")
      $('.sound').checkbox('set enabled')
      $('#enabled').html('Enabled')
      $('.notificationsCheck').checkbox('check');

    }

    if (sound === true) {
      $('.sound').checkbox('check')
    }
    if (sound === false) {
      $('.sound').checkbox('uncheck')
    }

  });



  $('.notificationsCheck').checkbox({
    onChange : function() {
      state = $('.notificationsCheck').checkbox('is checked')
      chrome.storage.sync.set({'state': state})
      if  (state === false) {

        $('#dropdown').addClass("disabled")
        $('#enabled').html('Disabled')
        $('.divider').addClass("disabled")
        $('.sound').checkbox('set disabled')
      }
      if  (state === true) {
        $('#dropdown').removeClass("disabled")
        $('#enabled').removeClass("disabled")
        $('.divider').removeClass("disabled")
        $('#enabled').html('Enabled')
        $('.sound').checkbox('set enabled')

      }
    }
  });

  $('.sound').checkbox({
    onChange : function() {
      sound = $('.sound').checkbox('is checked')
      chrome.storage.sync.set({'sound': sound})
    }
  }
);
var audio = new Audio('/bell.mp3');

$('.play').click(function(){
  audio.play()
})

setInterval(function(){
  chrome.storage.sync.get(null, function(items) {
    hasKeys = items.hasKeys
    opened = items.opened

    if (hasKeys === "NO") {
      $('.allow')
      .transition('shake')
  ;
    }

    if (hasKeys === "YES" && !opened) {
      $('.arrow').css("display", "inline")
    } else if (hasKeys === "YES"){
      $('.arrow').css("display", "none")


    }


  });


},1000)

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






//Special shoutout to Jack Beck for contributing to the design!
