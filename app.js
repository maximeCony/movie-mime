'use strict';

var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  browserify = require('browserify-middleware'),
  ntp = require('socket-ntp'),
  video = {
    users: {},
    startedAt: null,
    at: null,
  },
  allowedDifference = 0.7;

app.use('/public/scripts/build/apps', browserify('./public/scripts/src/apps'));
app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendfile('./index.html');
});

var requireUpdate = function(video, clientVideo) {
  var serverDifference = (video.startedAt / 1000) - video.at,
    clientDifference = (clientVideo.timestamp / 1000) - clientVideo.at,
    max = Math.max(serverDifference, clientDifference),
    min = Math.min(serverDifference, clientDifference),
    difference = max - min;
  return difference > allowedDifference;
};

io.on('connection', function(socket) {

  ntp.sync(socket);
  video.users[socket.id] = {
    socket: socket,
    username: null,
  };
  var user = video.users[socket.id];
  
  socket.on('disconnect', function() {
    delete video.users[socket.id];
  });
  
  socket.on('video:play', function(params) {
    video.startedAt = params.timestamp;
    video.at = params.at;
    socket.broadcast.emit('video:play', params.at);
  });
  
  socket.on('video:pause', function() {
    socket.broadcast.emit('video:pause');
  });
  
  socket.on('video:timeupdate', function(params) {
    if (requireUpdate(video, params)) {
      user.socket.emit('video:updatetime', params.at);
    }
  });

});

http.listen(process.env.PORT, function() {
  console.log('listening on port '+ process.env.PORT);
});