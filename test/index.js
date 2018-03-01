/**
 * Module dependencies.
 */

require('mocha-generators')
  .install();

var Nightmare = require('nightmare');
var should = require('chai')
  .should();
var url = require('url');
var server = require('./server');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var rimraf = require('rimraf');

/**
 * Temporary directory
 */

var tmp_dir = path.join(__dirname, 'tmp')

/**
 * Get rid of a warning.
 */

process.setMaxListeners(0);

/**
 * Locals.
 */

var base = 'http://localhost:7500/';
var serverInstance;
describe('Nightmare download manager', function() {
  before(function(done) {
    require('../nightmare-download-manager')(Nightmare);
    serverInstance = server.listen(7500, done);
  });
  after(function(done){
    serverInstance.close();
    done();
  });

  it('should be constructable', function * () {
    var nightmare = Nightmare();
    nightmare.should.be.ok;
    nightmare.waitDownloadsComplete.should.be.ok;
    yield nightmare.end();
  });

  describe('downloads', function() {
    var nightmare;

    before(function(done) {
      mkdirp(path.join(tmp_dir, 'subdir'), done);
    })

    after(function(done) {
      rimraf(tmp_dir, done)
    })

    afterEach(function * () {
      yield nightmare.end();
    });

    it('should download a file', function * () {
      var downloadItem, statFail = false;

      nightmare = Nightmare({
        paths: {
          'downloads': tmp_dir
        }
      });

      yield nightmare
        .downloadManager()
        .goto(fixture('downloads'))
        .click('#dl1')
        .waitDownloadsComplete();

      downloadItem = nightmare._downloads['100kib.txt'];
      try {
        fs.statSync(path.join(tmp_dir, '100kib.txt'));
      } catch (e) {
        statFail = true;
      }

      downloadItem.should.be.ok;
      downloadItem.filename.should.equal('100kib.txt');
      downloadItem.state.should.equal('completed');
      statFail.should.be.false;
    });

    it('should error when download time exceeds timeout', function * () {
      var didFail = false;

      nightmare = Nightmare({
        paths: {
          'downloads': tmp_dir
        },
        downloadTimeout: 1
      });
      try {
        yield nightmare
          .downloadManager()
          .goto(fixture('downloads'))
          .click('#dl2')
          .waitDownloadsComplete();
      } catch (e) {
        didFail = true;
      }

      didFail.should.be.true;
    });

    it('should set a path for a specific download', function * () {
      var downloadItem, statFail = false,
        finalState;

      nightmare = Nightmare({
        paths:{
          downloads: tmp_dir
        }
      });
      nightmare.on('download', function(state, download) {
        if (state == 'started') {
          nightmare.emit('download', path.join(tmp_dir, 'subdir', '100kib.txt'), download);
        } else if (state == 'completed' || state == 'cancelled' || state == 'interrupted') {
          finalState = state;
          downloadItem = download;
        }
      });

      yield nightmare
        .downloadManager()
        .goto(fixture('downloads'))
        .click('#dl1')
        .waitDownloadsComplete();

      try {
        fs.statSync(path.join(tmp_dir, 'subdir', '100kib.txt'));
      } catch (e) {
        statFail = true;
      }

      downloadItem.should.be.ok;
      finalState.should.equal('completed');
      statFail.should.be.false;
    });

    it('should cancel a specific download', function * () {
      var downloadItem, finalState;

      nightmare = Nightmare({
        paths: {
          downloads: tmp_dir
        }
      });
      nightmare.on('download', function(state, download) {
        if (state == 'started') {
          nightmare.emit('download', 'cancel', download);
        } else if (state == 'completed' || state == 'cancelled' || state == 'interrupted') {
          finalState = state;
          downloadItem = download;
        }
      });

      yield nightmare
        .downloadManager()
        .goto(fixture('downloads'))
        .click('#dl1')
        .waitDownloadsComplete();

      downloadItem.should.be.ok;
      finalState.should.equal('cancelled');
    });

    it('should ignore all downloads', function * () {
      nightmare = Nightmare({
        paths: {
          'downloads': tmp_dir
        },
        ignoreDownloads: true
      });

      yield nightmare
        .downloadManager()
        .goto(fixture('downloads'))
        .click('#dl1')
        .click('#dl2')
        .waitDownloadsComplete();

      Object.keys(nightmare._downloads)
        .length.should.equal(0);
    });
  });
});

/**
 * Generate a URL to a specific fixture.
 * @param {String} path
 * @returns {String}
 */

function fixture(path) {
  return url.resolve(base, path);
}
