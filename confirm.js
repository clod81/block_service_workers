function isFirefox(){
  if(typeof chrome !== "undefined" && typeof browser !== "undefined"){
    return true;
  }
  return false;
}


function get_behavior_mode(cb){
  if (isFirefox()) {
    cb('block');
  }
  chrome.storage.sync.get('__default_behavior__', function(data){
    console.log(data)
    if(typeof data['__default_behavior__'] === 'undefined' || data['__default_behavior__'] === null){
      chrome.storage.sync.set({'__default_behavior__': 'ask'});
      cb('ask');
      return;
    }
    cb(data['__default_behavior__']);
  });
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
    chrome.notifications.clear(notificationId);
  });
}else{
  chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    saveDomain(notificationId, buttonIndex, true);
    chrome.notifications.clear(notificationId);
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.message == "ask" && request.domain && request.path && request.pathname) {
    var path = request.path.replace(/\/\//g, "/").replace(/\.js\?.*/, '.js');
    if(path.charAt(0) !== '/'){
      path = request.pathname.replace(/\/\//g, "/").replace(/\.js\?.*/, '.js') + path;
    }
    var options = {
        type: "basic",
        iconUrl: chrome.extension.getURL("logo.png")
      };
      get_behavior_mode(function (behavior_mode) {
        if (behavior_mode === 'ask') {
          console.log('Asking');
          if(isFirefox()){ // disable, unless user allows manually
            saveDomain(request.domain + '|' + path, 1, false);
            options['title'] = "A Service Worker has been blocked for this website (" + request.domain + path + ")?";
            options['message'] = "Click this notification to re-enable this Service Worker";
          }else{
            options['buttons'] = [
              {title: "YES"},
              {title: "NO"}
            ];
            options['title'] = "Do you want to ALLOW this Service Worker for this website (" + request.domain + path + ")?";
            options['message'] = "Click YES to allow, or NO to block";
            options['requireInteraction'] = true;
          }
          chrome.notifications.create(request.domain + '|' + path, options);
        }
        if (behavior_mode === 'allow') {
          console.log('Allowing');
          saveDomain(request.domain + '|' + path, 0, false);
        }
        if (behavior_mode === 'block') {
          console.log('Blocking');
          saveDomain(request.domain + '|' + path, 1, false);
        }
    });
  }
});
