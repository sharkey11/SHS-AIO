$(document).ready(function(){

var consumerKey;
var consumerSecret;

chrome.runtime.sendMessage({readyFromContent1:'ready' })

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // alert(request.readyFromJS)
    if (request.readyFromJS === 'Ready') {

      console.log('get credentials')
      if (window.location.href !== "https://schoology.westportps.org/api") {
        window.location.href = "https://schoology.westportps.org/api";
      }
    }
    if (window.location.href == "https://schoology.westportps.org/api") {
      console.log('On API')
      $('#edit-request').click();
      if($('#edit-current-key').length > 0 && $('#edit-current-secret').length > 0) {
        consumerKey = $('#edit-current-key').val()
        consumerSecret = $('#edit-current-secret').val();
        chrome.runtime.sendMessage({consumerKey:consumerKey, consumerSecret:consumerSecret })
        chrome.runtime.sendMessage({contentIsDone:'ready' })
        close();
      }
      // alert('AT THE END OF ONE. CURRENT CONSUMER IS ' + consumerKey)
    }
  });
})
