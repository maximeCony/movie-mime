'use strict';

var socket = io(),
  $video = $('#js-video'),
  allowedDifference = 0.6,
  emitTimeUpdateInterval;

var emitTimeUpdate = function() {
  socket.emit('timeupdate', $video[0].currentTime);
};

$video
  .on('play', function() {
    socket.emit('play');
    clearInterval(emitTimeUpdateInterval);
    emitTimeUpdateInterval = setInterval(emitTimeUpdate, 1500);
  })
  .on('pause', function() {
    socket.emit('pause');
    clearInterval(emitTimeUpdateInterval);
  });

socket
  .on('play', function() {
    $video[0].play();
  })
  .on('pause', function() {
    $video[0].pause();
  })
  .on('timeupdate', function(at) {
    if ($video[0].seeking) return;
    var currentTime = $video[0].currentTime,
      difference = Math.max(currentTime, at) - Math.min(currentTime, at);
    if (difference > allowedDifference) {
      $video[0].currentTime = at;
    }
  });
