// chrome.storage.sync.get(null, function(items) {
  // var allKeys = Object.keys(items);
  // console.log(allKeys);
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.message == "domain"){
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
      var url = new URL(tabs[0].url);      
      chrome.tabs.sendMessage(tabs[0].id, {message: 'domain', domain: url.hostname}, function(r){});
    });
  }
});