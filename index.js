var override_service_worker;
var keepOriginal = 'var __bsw_original__=navigator.serviceWorker.register;';
var blockSW = 'if("serviceWorker" in navigator){navigator.serviceWorker.register=function(){return new Promise(function(res, rej){rej(Error("Blocked by Block Service Workers extension"))})}}';

function setPageJS(content){
  var script = document.createElement('script');
  script.textContent = content;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}

// GET USER CHOICE FROM WEB PAGE
window.addEventListener("message", function(event){
  if(event.source != window){
    return;
  }
  if (event.data.type && event.data.text){
    if(event.data.type != 'DECIDE_SERVICE_WORKERS'){
      return;
    }
    chrome.runtime.sendMessage({message: "ask", domain: event.data.text});
  }
}, false);

// RETRIEVE DOMAIN FROM BACKGROUND SCRIPT
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  // User selected to block, clear all existing SWs
  if(request.message == "remove"){
    var content = 'if ("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){';
        content += 'for(let reg of regs){';
          content += 'reg.unregister();'
         content +='}'; 
      content += '})};'
    setPageJS(content);
    return;
  }
});

// Prevent registration by default. There is a small chance that registration happens before storage entry can be queried (almost never)
setPageJS(keepOriginal + blockSW);

var domain = document.domain;
// RETRIEVE STORED USER PREFERENCE
chrome.storage.sync.get(domain, function(data){
  var storedValue;  
  if(data[domain] != null){
    storedValue = data[domain];
  }
  if(storedValue === true){ // Already ALLOWED
    setPageJS('navigator.serviceWorker.register=__bsw_original__;');
  } else {
    if(storedValue === false){ // Already DISALLOWED
      override_service_worker = blockSW;
    } else { // Not yet ASKED
      override_service_worker  = 'if ("serviceWorker" in navigator){navigator.serviceWorker.register = function(){';
          override_service_worker += 'window.postMessage({type:"DECIDE_SERVICE_WORKERS",text:window.location.hostname}, "*");';
          override_service_worker += 'return new Promise(function(res, rej){rej(Error("Allow or Block Service Workers for this domain"))})';
      override_service_worker += '}}';
    }
    // INSERT SCRIPT INTO PAGE
    setPageJS(override_service_worker);
  }
});