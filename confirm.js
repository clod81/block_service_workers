if(chrome && chrome.storage){ // only in Chrome
  function saveDomain(domain, type){
    chrome.storage.sync.get('__block_service_workers', function(data){
      if(!data){
        data = {};
      }else{
        if(data.__block_service_workers){
          data = data.__block_service_workers;
          if(!data){
            data = {};
          }
        }
      }
      var callback;
      if(type === 0){
        data[domain] = true;
        chrome.storage.sync.set({ '__block_service_workers': data }, function(){
          chrome.tabs.query({url: 'https://' + domain + '/*'}, function(tabs){
            chrome.tabs.reload(tabs[0].id);
          });
        });
      }
      if(type === 1){
        data[domain] = false;
        chrome.storage.sync.set({ '__block_service_workers': data });
      }
    });
  }
  
  chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    saveDomain(notificationId, buttonIndex);
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.message == "domain"){
      chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
        var url = new URL(tabs[0].url);
        chrome.tabs.sendMessage(tabs[0].id, {message: 'domain', domain: url.hostname});
      });
    }
    if(request.message == "ask"){
      chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
        var url = new URL(tabs[0].url);
        chrome.notifications.create(url.hostname,
          {
            type: "basic",
            requireInteraction: true,
            title: "Do you want to ALLOW Service Workers for this website (" + url.hostname + ")?",
            iconUrl: chrome.extension.getURL("logo.png"),
            message: "Click YES to allow, or NO to block",
            buttons: [
              {title: "YES"},
              {title: "NO"}
            ]
          }
        );
      });
    }
  });
}