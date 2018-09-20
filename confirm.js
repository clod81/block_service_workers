if(chrome && chrome.storage){ // only in Chrome
  function saveDomain(domain, type){
    chrome.storage.sync.get(domain, function(data){
      var data = {};
      if(type === 0){
        data[domain] = true;
        chrome.storage.sync.set(data, function(){
          chrome.tabs.query({url: 'https://' + domain + '/*'}, function(tabs){
            chrome.tabs.reload(tabs[0].id);
          });
        });
      }
      if(type === 1){
        data[domain] = false;
        chrome.storage.sync.set(data);
      }
    });
  }
  
  chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    saveDomain(notificationId, buttonIndex);
  });

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
      chrome.notifications.create(request.domain,
        {
          type: "basic",
          requireInteraction: true,
          title: "Do you want to ALLOW Service Workers for this website (" + request.domain + ")?",
          iconUrl: chrome.extension.getURL("logo.png"),
          message: "Click YES to allow, or NO to block",
          buttons: [
            {title: "YES"},
            {title: "NO"}
          ]
        }
      );
    }
  });
}