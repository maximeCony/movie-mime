'use strict';

var socket = io(),
  $video = $('#js-video'),
  allowedDifference = 0.7,
  emitPlay = true,
  emitPause = true;

var updateCurrentTime = function(at) {
  var currentTime = $video[0].currentTime,
    difference = Math.max(currentTime, at) - Math.min(currentTime, at);
  if (difference > allowedDifference) {
    $video[0].currentTime = at;
  }
};

$video
  .on('play', function() {
    if (!emitPlay) return emitPlay = true;
    var params = {
      at: $video[0].currentTime, 
      timestamp: Date.now(),
    };
    socket.emit('play', params);
  })
  .on('pause', function() {
    if (!emitPause) return emitPause = true;
    socket.emit('pause');
  })
  .on('timeupdate', function() {
    var params = {
      at: $video[0].currentTime, 
      timestamp: Date.now(),
    };
    socket.emit('timeupdate', params);
  });

socket
  .on('play', function(at) {
    // prevent to re-emit play
    updateCurrentTime(at);
    emitPlay = false;
    $video[0].play();
  })
  .on('pause', function() {
    // prevent to re-emit pause
    emitPause = false;
    $video[0].pause();
  })
  .on('updatetime', function(at) {
    updateCurrentTime(at);
  });
