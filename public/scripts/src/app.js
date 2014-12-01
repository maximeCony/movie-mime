'use strict';

var socket = io(),
  _URL = window.URL || window.webkitURL,
  $video = $('#js-video'),
  video = $video[0],
  $playPauseVideo = $('.js-playPauseVideo'),
  $muteVideo = $('.js-muteVideo'),
  $fullScreenVideo = $('.js-fullScreenVideo'),
  $seekVideo = $('.js-seekVideo'),
  $setVolumeVideo = $('.js-setVolumeVideo'),
  $handler = $('#js-dragDropFileHandler'),
  $fileName = $('#js-fileName'),
  $usernameInput = $('#usernameInput'),
  allowedDifference = 0.7;

var handleFile = function(file) {
  $handler.hide();
  $video.fadeIn();
  $fileName.text(file.name).fadeIn();
  video.src = _URL.createObjectURL(file);
};

var updateCurrentTime = function(at) {
  var currentTime = video.currentTime,
    difference = Math.max(currentTime, at) - Math.min(currentTime, at);
  if (difference > allowedDifference) {
    video.currentTime = at;
  }
};

var createAlert = function(type, message) {
  console.log(type, message);
  // TODO!
};

$video
  .on('play', function() {
    $playPauseVideo.html('Pause');
  })
  .on('pause', function() {
    $playPauseVideo.html('Play');
  })
  .on('timeupdate', function() {
    if (video.seeking) return;
    var value = (10000 * video.currentTime) / video.duration;
    $seekVideo.val(value);
    socket.emit('video:timeupdate', {
      at: $video[0].currentTime, 
      timestamp: Date.now(),
    });
  });

$playPauseVideo
  .on('click', function() {
    if (video.paused !== true) {
      return socket.emit('video:pause');
    }
    socket.emit('video:play', {
      at: video.currentTime, 
      timestamp: Date.now(),
    });
  });

$muteVideo
  .on('click', function() {
    if (video.muted === false) {
      video.muted = true;
      $muteVideo.html('Unmute');
    } else {
      video.muted = false;
      $muteVideo.html('Mute');
    }
  });

$setVolumeVideo
  .on('change', function() {
    video.volume = $setVolumeVideo.val();
  });

$fullScreenVideo
  .on('click', function() {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
      // Firefox
      video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) {
      // Chrome and Safari
      video.webkitRequestFullscreen();
    }
  });

$seekVideo
  .on('change', function() {
    var at = ($seekVideo.val() * video.duration) / 10000;
    socket.emit('video:seek', {
      at: at, 
      timestamp: Date.now(),
    });
  })
  .on('mousedown', function() {
    video.pause();
    socket.emit('video:pause');
  })
  .on('mouseup', function() {
    var params = {
      at: video.currentTime, 
      timestamp: Date.now(),
    };
    socket.emit('video:play', params);
  });

socket
  .on('video:play', function(at) {
    // updateCurrentTime(at);
    video.play();
  })
  .on('video:pause', function() {
    video.pause();
  })
  .on('video:updatetime', function(at) {
    updateCurrentTime(at);
  })
  .on('alert', function(params) {
    createAlert(params.type, params.message);
  });

// Drag and drop

$(document)
  .on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
  })
  .on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $handler.addClass('fileHandler-dragOver');
  })
  .on('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $handler.removeClass('fileHandler-dragOver');
  })
  .on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;
    handleFile(files[0]);
  });

$usernameInput.focus();
