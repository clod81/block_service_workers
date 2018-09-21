function isFirefox() {
  if (typeof chrome !== "undefined") {
    if (typeof browser !== "undefined") {
      return true;
    }      
  }
  return false;
}

function saveDomain(domain, type, fireCallback){
  var data = {};
  if(type === 0){
    data[domain] = true;
  }
  if(type === 1){
    data[domain] = false;
  }
  chrome.storage.sync.set(data, function(){
    if(fireCallback){
      chrome.tabs.query({url: 'https://' + domain + '/*'}, function(tabs){
        if(data[domain]){
          chrome.tabs.reload(tabs[0].id);
        }else{
          chrome.tabs.sendMessage(tabs[0].id, {message: 'remove'});
        }
      });
    }
  });
}

if(isFirefox()){
  chrome.notifications.onClicked.addListener(function(notificationId){
    saveDomain(notificationId, 0, true);
  });
}else{
  chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    saveDomain(notificationId, buttonIndex, true);
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.message == "domain"){
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
      if(tabs[0]){
        var url = new URL(tabs[0].url);
        chrome.tabs.sendMessage(tabs[0].id, {message: 'domain', domain: url.hostname});
      }
    });
  }
  if(request.message == "ask" && request.domain){
    var options = {
        type: "basic",
        iconUrl: chrome.extension.getURL("logo.png")
      }
    if(isFirefox()){ // disable, unless user allows manually
      saveDomain(request.domain, 1, false);
      options['title'] = "Service Workers have been blocked for this website (" + request.domain + ")?";
      options['message'] = "Click this notification to re-enable Service Workers";
    }else{
      options['buttons'] = [
        {title: "YES"},
        {title: "NO"}
      ];
      options['title'] = "Do you want to ALLOW Service Workers for this website (" + request.domain + ")?";
      options['message'] = "Click YES to allow, or NO to block";
      options['requireInteraction'] = true;
    }
    chrome.notifications.create(request.domain, options);
  }
});
