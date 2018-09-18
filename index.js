var storedValue;
var override_service_worker;

// GET USER CHOICE FROM WEB PAGE
window.addEventListener("message", function(event) {  
  console.log("MESSAGE");
  if(event.source != window){
    return;
  }
  if (event.data.type && event.data.text){
    var domain = event.data.text;
    var type   = event.data.type;
    console.log("domain: " + domain);
    console.log("type: " + type);
    if(type == "ALLOW_SERVICE_WORKERS"){
      chrome.storage.sync.set({ domain: true });
    }
    if(type == "DISALLOW_SERVICE_WORKERS"){
      chrome.storage.sync.set({ domain: false });
    }
  }
}, false);

// ASK BACKGROUND SCRIPT CURRENT DOMAIN
chrome.runtime.sendMessage({message: "domain"}, function(response){});

// RETRIEVE DOMAIN FROM BACKGROUND SCRIPT
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.message == "domain"){
    console.log("response");
    console.log(request);
    // RETRIEVE STORED USER PREFERENCE
    chrome.storage.sync.get(request.domain, function(data){
      console.log("data");
      console.log(data);
      storedValue = data.domain;
      if(storedValue === true){ // Already ALLOWED
        return;
      } else {
        if(storedValue === false){ // Already DISALLOWED
          override_service_worker  = 'if ("serviceWorker" in navigator){navigator.serviceWorker.register = function(){';
            override_service_worker += 'return new Promise(function(res, rej){rej(Error("Blocked by Block Service Workers extension"))})';
          override_service_worker += '}}';
        } else { // Not yet ASKED
          override_service_worker  = 'if ("serviceWorker" in navigator){navigator.serviceWorker.register = function(){';
                override_service_worker += 'if (confirm("Allow Service Workers on this domain?")){';
                  override_service_worker += 'window.postMessage({type:"ALLOW_SERVICE_WORKERS",text:window.location.hostname}, "*");';
                  override_service_worker += 'alert("Reload the page to activate Service Workers");';
                  override_service_worker += 'return new Promise(function(res, rej){rej(Error("Reload the page to activate Service Workers"))})';
                override_service_worker += '} else {';
                  override_service_worker += 'window.postMessage({type:"DISALLOW_SERVICE_WORKERS",text:window.location.hostname}, "*");';
                  override_service_worker += 'return new Promise(function(res, rej){rej(Error("Blocked by Block Service Workers extension"))})';
                override_service_worker += '}';
          override_service_worker += '}}';
        }
        // INSERT SCRIPT INTO PAGE
        var script = document.createElement('script');
        script.textContent = override_service_worker;
        (document.head||document.documentElement).appendChild(script);
        script.remove();
      }  
    });
  }
});