function isFirefox(){
  if(typeof chrome !== "undefined" && typeof browser !== "undefined"){
    return true;
  }
  return false;
}

function splitDomainPathFromNotificationId(notificationId){
  var split = notificationId.split('|');
  return {domain: split[0], path: split[1]};
}

function saveDomain(notificationId, type, fireCallback){
  var split = splitDomainPathFromNotificationId(notificationId);
  var domain = split.domain;
  var path = split.path;
  chrome.storage.sync.get(domain, function(data){
    if(data[domain] === null || typeof data[domain] !== 'object'){
      data[domain] = {};
    }
    data[domain][path] = (type === 0);
    chrome.storage.sync.set(data, function(){
      if(fireCallback){
        chrome.tabs.query({url: 'https://' + domain + '/*'}, function(tabs){
          if(data[domain][path]){
            chrome.tabs.reload(tabs[0].id);
          }else{
            chrome.tabs.sendMessage(tabs[0].id, {message: 'remove', scriptURL: 'https://' + domain + path});
          }
        });
      }
    });
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
  if(request.message == "ask" && request.domain && request.path){
    var options = {
        type: "basic",
        iconUrl: chrome.extension.getURL("logo.png")
      }
    if(isFirefox()){ // disable, unless user allows manually
      saveDomain(request.domain + '|' + request.path, 1, false);
      options['title'] = "A Service Worker has been blocked for this website (" + request.domain + "/" + request.path + ")?";
      options['message'] = "Click this notification to re-enable this Service Worker";
    }else{
      options['buttons'] = [
        {title: "YES"},
        {title: "NO"}
      ];
      options['title'] = "Do you want to ALLOW this Service Worker for this website (" + request.domain + "/" + request.path + ")?";
      options['message'] = "Click YES to allow, or NO to block";
      options['requireInteraction'] = true;
    }
    chrome.notifications.create(request.domain + '|' + request.path, options);
  }
});
