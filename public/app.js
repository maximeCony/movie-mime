'use strict';

var socket = io(),
  $video = $('#js-video'),
  allowedDifference = 0.5,
  lastTime;

$video
  .on('play', function() {
    socket.emit('play');
  })
  .on('pause', function() {
    socket.emit('pause');
  })
  .on('timeupdate', function() {
    var currentTime = $video[0].currentTime,
      difference = Math.max(currentTime, lastTime) - 
        Math.min(currentTime, lastTime);
    if (difference > allowedDifference) {
      socket.emit('timeupdate', currentTime);
    }
    lastTime = currentTime;
  });

socket
  .on('play', function() {
    $video[0].play();
  })
  .on('pause', function() {
    $video[0].pause();
  })
  .on('timeupdate', function(at) {
    var currentTime = $video[0].currentTime,
      difference = Math.max(currentTime, at) - Math.min(currentTime, at);
    if (difference > allowedDifference) {
      $video[0].currentTime = at;
    }
  });
