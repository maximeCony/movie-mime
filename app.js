'use strict';

var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  browserify = require('browserify-middleware'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  socketModule = require('./server/modules/socket-module'),
  roomModule = require('./server/modules/room-module');

app.use('/public/scripts/build/apps', browserify('./public/scripts/src/apps'));
app.use('/public', express.static(__dirname + '/public'));

// parse body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendfile('./server/views/index.html');
});

app.use(roomModule);
socketModule(io);

mongoose.connect('mongodb://localhost/movie-mime');
var db = mongoose.connection;
db
  .once('open', function() {
    http.listen(process.env.PORT, function() {
      console.log('listening on port '+ process.env.PORT);
    });
  })
  .on('error', console.error.bind(console, 'connection error:'));
