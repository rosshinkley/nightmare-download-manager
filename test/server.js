var express = require('express'),
  path = require('path'),
  serve = require('serve-static'),
  util = require('util'),
  mime = require('mime'),
  async = require('async');

var app = module.exports = express();

app.get('/download/:size', function(req, res) {

  var conversion = {};
  conversion.kib = {
    factor: 1024,
    chunksize: Math.pow(2, 8)
  };
  conversion.mib = {
    factor: 1024 * 1024,
    chunksize: Math.pow(2, 16)
  };

  var parts = /^(\d+)([a-z]{2,3})\.(\w+)$/.exec(req.params.size);
  var s = conversion[parts[2].toLowerCase()];
  var size = parseInt(parts[1], 10) * s.factor;

  var mimetype = mime.lookup(req.params.size);

  res.setHeader('Content-disposition', 'attachment; filename=' + req.params.size);
  res.setHeader('Content-length', size);
  res.setHeader('Content-type', mimetype);

  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  var tasks = []
  for (var i = 0; i < size / s.chunksize; i++) {
    tasks.push(function(cb) {
      setTimeout(function() {
        var str = [];
        for (var j = 0; j < s.chunksize; j++) {
          str.push(possible.charAt(Math.floor(Math.random() * possible.length)));
        }
        res.write(str.join(''));
        cb();
      }, 1);
    });
  }

  if (size % s.chunksize > 0) {
    tasks.push(function(cb) {
      var str = [];
      for (var j = 0; j < size % s.chunksize; j++) {
        str.push(possible.charAt(Math.floor(Math.random() * possible.length)));
      }
      res.write(str.join(''));
      cb();
    });
  }

  async.series(tasks, function() {
    res.end();
  });
});

app.use(serve(path.resolve(__dirname, 'fixtures')));

if (!module.parent) app.listen(7500);
