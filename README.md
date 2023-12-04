This repo has been archived. Extensions require to be migrated to version 3. I have no time to keep it updated, so I decided to discontinue the support and development on this.

Extension to block Service Workers registration in Chrome
=========

This project has been developed following the research and the development of the tool: https://shadow-workers.github.io

[Chrome Web Store](https://chrome.google.com/webstore/detail/block-service-workers/ceokjgeibfjfcboemhdpkdalankbmnej)



Previous version works on Firefox. Support for Firefox has been discontinued, because major differences with Chrome

[Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/block-service-workers/)


When loaded, this extension will prevent Service Workers to be registered.

If you want to manually install it on Firefox from this code, change the `manifest.json` to:
```
{
  "manifest_version": 2,
  "applications": {
    "gecko": {
      "id": "bloooockserviceworkers@eeeeeeeeeeeeeeeeeemail.com",
      "strict_min_version": "52.0"
    }
  },
  "name": "Block Service Workers",
  "description": "Disallow to register Service Workers",
  "version": "0.3.0",
  "icons": {
     "16": "logox16.png",
     "48": "logox48.png",
    "128": "logo.png" 
  },        
  "permissions":[
    "tabs",
    "storage",
    "notifications"
  ],
  "background":
  {
    "scripts": ["confirm.js"]    
  },
  "browser_action": {
    "default_icon": "logox32.png",
    "default_popup": "settings.html"
  },
  "content_scripts": [
    {
      "matches": ["https://*/*"],
      "run_at": "document_start",
      "js": ["index.js"]
    }
  ]
}
```

![POC](https://i.imgur.com/eQ8Cim0.png)

## Authors ##

  * [Claudio Contin](http://github.com/clod81)
  
## License

This tool is released under the [MIT License](https://opensource.org/licenses/MIT).

## How to contribute

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
