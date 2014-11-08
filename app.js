'use strict';

var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http);

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendfile('./index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  socket.on('play', function(){
    io.emit('play');
  });
  socket.on('pause', function(){
    io.emit('pause');
  });
  socket.on('timeupdate', function(at) {
    io.emit('timeupdate', at);
  });
});

http.listen(process.env.PORT, function() {
  console.log('listening on port '+ process.env.PORT);
});