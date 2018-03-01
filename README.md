nightmare-download-manager
======================

Add download management to your [Nightmare](http://github.com/segmentio/nightmare) scripts.

# Important Note
If you want to have downloads be managed serially, check out the [Nightmare inline download plugin](https://github.com/rosshinkley/nightmare-inline-download).

## Usage
Require the library and pass the Nightmare library as a reference to attach the plugin actions:

```js
var Nightmare = require('Nightmare');
require('nightmare-download-manager')(Nightmare);
```
... and then enable the download manager with `.downloadManager()`.  It should be the first call in your Nightmare chain.

### .downloadManager()
Sets up the download management event handling.

### .waitDownloadsComplete()
Waits until all files currently downloading are in a state of `'completed'`, `'interrupted'`, or `'cancelled'`.

### .on('download', function(state, downloadItem) 
This event is triggered when Electron emits `'will-download'`.  This event is also emitted after downloads are started when [`DownloadItem`](https://github.com/atom/electron/blob/master/docs/api/download-item.md) emits `'updated'` or `'done'`.   The possible values for `state` are `'started'`, `'cancelled'`, `'interrupted'`, or `'completed'`.  Note that by listening to `'download'`, Nightmare expects the default download behavior to be overridden. 

### .emit('download', [path|action,] downloadItem)
Allows for downloads to be saved to a custom location, cancelled, or any other custom behavior.  The possible values for `action` are `'cancel'`, `'continue'` for default behavior, or a file path (file name and extension inclusive) to save the download to an alternative location. The `downloadItem` parameter should use the `downloadItem` passed by `'download'`.

## Additional Nightmare Options

### ignoreDownloads
Defines whether or not all downloads should be ignored.  By default, all downloads are accepted.

### downloadTimeout
This will throw an exception if the `.waitDownloadsComplete()` didn't finish within the set timeframe.  By default, this is not set, meaning there is no timeout. In milliseconds.

### downloadResponseWait
Defines the length of time to wait for a download response in milliseconds.  Defaults to 3s.

### paths.downloads
Sets the Electron path for where downloads are saved.

## Example

```javascript
var Nightmare = require('nightmare');
require('nightmare-download-manager')(Nightmare);
var nightmare = Nightmare();
nightmare.on('download', function(state, downloadItem){
  if(state == 'started'){
    nightmare.emit('download', '/some/path/file.zip', downloadItem);
  }
});

nightmare
  .downloadManager()
  .goto('https://github.com/segmentio/nightmare')
  .click('a[href="/segmentio/nightmare/archive/master.zip"]')
  .waitDownloadsComplete()
  .then(() => {
    console.log('done');
  })
```
