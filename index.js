var override_service_worker;
var blockSW = 'if("serviceWorker" in navigator){navigator.serviceWorker.register=function(){return new Promise(function(res, rej){rej(Error("Blocked by Block Service Workers extension"))})}}';

function setPageJS(content){
  var script = document.createElement('script');
  script.textContent = content;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}

if(chrome && chrome.storage){ // only in Chrome
  // GET USER CHOICE FROM WEB PAGE
  window.addEventListener("message", function(event) {  
    if(event.source != window){
      return;
    }
    if (event.data.type && event.data.text){
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
        var domain = event.data.text;
        var type   = event.data.type;
        if(type == "ALLOW_SERVICE_WORKERS"){
          data[domain] = true;
        }
        if(type == "DISALLOW_SERVICE_WORKERS"){
          data[domain] = false;
        }
        chrome.storage.sync.set({ '__block_service_workers': data });
      });
    }
  }, false);

  // ASK BACKGROUND SCRIPT CURRENT DOMAIN
  chrome.runtime.sendMessage({message: "domain"}, function(response){});
}

if(chrome && chrome.storage){ // only in Chrome
  // RETRIEVE DOMAIN FROM BACKGROUND SCRIPT
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.message == "domain"){
      var domain = request.domain;
      // RETRIEVE STORED USER PREFERENCE
      chrome.storage.sync.get('__block_service_workers', function(data){
        var storedValue = null;
        if(data.__block_service_workers){
          storedValue = data.__block_service_workers[domain];
        }
        if(storedValue === true){ // Already ALLOWED
          return;
        } else {
          if(storedValue === false){ // Already DISALLOWED
            override_service_worker = blockSW;
          } else { // Not yet ASKED
            override_service_worker  = 'if ("serviceWorker" in navigator){navigator.serviceWorker.register = function(){';
                  override_service_worker += 'if (confirm("Allow Service Workers on this domain?")){';
                    override_service_worker += 'window.postMessage({type:"ALLOW_SERVICE_WORKERS",text:window.location.hostname}, "*");';
                    override_service_worker += 'setTimeout(function(){window.location.reload()}, 150);';
                    override_service_worker += 'return new Promise(function(res, rej){rej(Error("Reload the page to activate Service Workers"))})';
                  override_service_worker += '} else {';
                    override_service_worker += 'window.postMessage({type:"DISALLOW_SERVICE_WORKERS",text:window.location.hostname}, "*");';
                    override_service_worker += 'return new Promise(function(res, rej){rej(Error("Blocked by Block Service Workers extension"))})';
                  override_service_worker += '}';
            override_service_worker += '}}';
          }
          // INSERT SCRIPT INTO PAGE
          setPageJS(override_service_worker);
        }
      });
    }
  });
}else{ // non Chrome browsers
  setPageJS(blockSW);
}