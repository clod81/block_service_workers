Extension to block Service Workers registration in Chrome and Firefox browsers
=========

When loaded, this extension will prevent Service Workers to be registered.
On Chrome, the user will be prompted to trust the domain, or block all service workers under it.
On Firefox, at this stage, the extension only blocks and does not allow to specify which domains to block or grant Service Workers registration.
If you want to manually install it on Firefox from this code, change the `manifest.json` to:
```
{
  "manifest_version": 2,
  "name": "Block Service Workers",
  "description": "Disallow to register Service Workers",
  "version": "0.0.2",
  "content_scripts": [
    {
      "matches": ["https://*/*"],
      "run_at": "document_start",
      "js": ["index.js"]
    }
  ]
}
```

![POC](https://raw.githubusercontent.com/clod81/block_service_workers/master/poc.png)

## Authors ##

  * [Claudio Contin](http://github.com/clod81)

## How to contribute

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
