'use strict';

var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  video = {
    users: {},
    // paused: true,
    startedAt: null,
    at: null,
  },
  allowedDifference = 0.7;

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendfile('./index.html');
});

var requireUpdate = function(serverDifference, clientDifference) {
  var max = Math.max(serverDifference, clientDifference),
    min = Math.min(serverDifference, clientDifference),
    difference = max - min;
  return difference > allowedDifference;
};

io.on('connection', function(socket) {
  video.users[socket.id] = {
    socket: socket,
  };
  var user = video.users[socket.id];
  socket.on('disconnect', function() {
    delete video.users[socket.id];
  });
  socket.on('play', function(params) {
    video.startedAt = params.timestamp;
    video.at = params.at;
    socket.broadcast.emit('play', params.at);
  });
  socket.on('pause', function() {
    socket.broadcast.emit('pause');
  });
  socket.on('timeupdate', function(params) {
    var serverDifference = (video.startedAt / 1000) - video.at,
      clientDifference = (params.timestamp / 1000) - params.at;
    if (requireUpdate(serverDifference, clientDifference)) {
      user.socket.emit('updatetime', params.at);
    }
  });
});

http.listen(process.env.PORT, function() {
  console.log('listening on port '+ process.env.PORT);
});