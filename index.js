var override_service_worker;
var override_function = "function(){";
      override_function += "return new Promise(function(res, rej){";
        override_function += "rej(Error('Blocked by Block Service Workers extension'));";
      override_function += "})";
  override_function += "}";
var override_function_ask = "function(){";
      override_function_ask += "window.postMessage({type:'DECIDE_SERVICE_WORKERS',text:window.location.hostname}, '*');";
      override_function_ask += "return new Promise(function(res, rej){";
        override_function_ask += "rej(Error('Allow or Block Service Workers for this domain'));";
      override_function_ask += "});";
    override_function_ask += "}";

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

// ASK BACKGROUND SCRIPT CURRENT DOMAIN
chrome.runtime.sendMessage({message: "domain"});

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
  // Get domain response
  if(request.message == "domain"){
    var domain = request.domain;
    // RETRIEVE STORED USER PREFERENCE
    chrome.storage.sync.get(domain, function(data){
      var storedValue;
      if(data[domain] != null){
        storedValue = data[domain];
      }
      if(storedValue === true){ // Already ALLOWED
        return;
      } else {
        override_service_worker = 'if("serviceWorker" in navigator){navigator.serviceWorker.register=';
        if(storedValue === false){ // Already DISALLOWED
          override_service_worker += override_function;
        } else { // Not yet ASKED
          override_service_worker += override_function_ask;
        }
        override_service_worker += '}';
        // INSERT SCRIPT INTO PAGE
        setPageJS(override_service_worker);
      }
    });
  }
});


// var iframe = document.getElementById('iframe');
// if(iframe){
//  var iframe_window = document.getElementById('iframe').contentWindow;
//  if(iframe_window){
//   iframe_window.confirm = window.confirm;
//  }
// }