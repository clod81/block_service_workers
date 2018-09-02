if ('serviceWorker' in navigator){
  var override_service_worker = 'navigator.serviceWorker.register = function(){return new Promise(function(res, rej){rej(Error("Blocked by Block Service Workers extension"))})};';
  var script = document.createElement('script');
  script.textContent = override_service_worker;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}