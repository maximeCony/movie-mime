'use strict';

var socket = io(),
  $video = $('#js-video'),
  allowedDifference = 0.5,
  listenToPlay = true,
  listenToPause = true,
  listenToTimeUpdate = true;

$video
  .on('play', function() {
    if (listenToPlay) {
      socket.emit('play');
    }
    listenToPlay = true;
  })
  .on('pause', function() {
    if (listenToPause) {
      socket.emit('pause');
    }
    listenToPause = true;
  })
  .on('timeupdate', function() {
    if (listenToTimeUpdate) {
      var currentTime = $video[0].currentTime;
      socket.emit('timeupdate', currentTime);
    }
    listenToTimeUpdate = true;
  });

socket
  .on('play', function() {
    listenToPlay = false;
    $video[0].play();
  })
  .on('pause', function() {
    listenToPause = false;
    $video[0].pause();
  })
  .on('timeupdate', function(at) {
    var currentTime = $video[0].currentTime,
      difference = Math.max(currentTime, at) - Math.min(currentTime, at);
    if (difference > allowedDifference) {
      listenToTimeUpdate = false;
      $video[0].currentTime = at;
    }
  });
