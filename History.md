0.2.4 / 2017-02-11
==================

  * Fixes an issue where for extremely small files and fast connections, the download may complete before `downloadItem.pause()` can be called, which causes an event disposal exception when `downloadItem.resume()` is called

0.2.3 / 2017-01-04
==================
  
  * Fixes an error for cross-device linking

0.2.2 / 2016-10-04
==================

  * Updates README for clarity on `downloadItem`.

0.2.1 / 2016-06-20
==================

  * adds Circle configuration
  * upgrades to Nightmare 2.5.1
  * fixes deprecated Electron refrences
  * fixes terminology in the readme
