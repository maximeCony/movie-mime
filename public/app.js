'use strict';

var socket = io(),
  $video = $('#js-video'),
  allowedDifference = 0.5,
  listenToPlay = true,
  listenToPause = true,
  listenToTimeUpdate = true,
  lastTime;

$video
  .on('play', function() {
    if (listenToPlay) {
      // console.log('emit play');
      socket.emit('play');
    }
    listenToPlay = true;
  })
  .on('pause', function() {
    if (listenToPause) {
      // console.log('emit pause');
      socket.emit('pause');
    }
    listenToPause = true;
  })
  .on('timeupdate', function() {
    if (listenToTimeUpdate) {
      // console.log('emit timeupdate');
      var currentTime = $video[0].currentTime;
      socket.emit('timeupdate', currentTime);
    }
    listenToTimeUpdate = true;
  })
  // .on('timeupdate', function() {
  //   var currentTime = $video[0].currentTime,
  //     difference = Math.max(currentTime, lastTime) - 
  //       Math.min(currentTime, lastTime);
  //   if (difference > allowedDifference) {
  //        console.log('emit timeupdate');
  //     socket.emit('timeupdate', currentTime);
  //   }
  //   lastTime = currentTime;
  // })
  ;

socket
  .on('play', function() {
    // console.log('recieved play');
    listenToPlay = false;
    $video[0].play();
  })
  .on('pause', function() {
    // console.log('recieved pause');
    listenToPause = false;
    $video[0].pause();
  })
  .on('timeupdate', function(at) {
    // console.log('recieved timeupdate');
    var currentTime = $video[0].currentTime,
      difference = Math.max(currentTime, at) - Math.min(currentTime, at);
    if (difference > allowedDifference) {
      // console.log('update time!!!!!');
      listenToTimeUpdate = false;
      $video[0].currentTime = at;
    }
  });
