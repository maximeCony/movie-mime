'use strict';

var socket = io(),
  _URL = window.URL || window.webkitURL,
  $video = $('#js-video'),
  $handler = $('#js-dragDropFileHandler'),
  $fileName = $('#js-fileName'),
  $usernameInput = $('#usernameInput'),
  allowedDifference = 0.7,
  emitPlay = true,
  emitPause = true;

var handleFile = function(file) {
  $handler.hide();
  $video.fadeIn();
  $fileName.text(file.name).fadeIn();
  $video[0].src = _URL.createObjectURL(file);
};

var updateCurrentTime = function(at) {
  var currentTime = $video[0].currentTime,
    difference = Math.max(currentTime, at) - Math.min(currentTime, at);
  if (difference > allowedDifference) {
    $video[0].currentTime = at;
  }
};

var createAlert = function(type, message) {
  console.log(type, message);
  // TODO!
};

$video
  .on('play', function() {
    if (!emitPlay) return emitPlay = true;
    var params = {
      at: $video[0].currentTime, 
      timestamp: Date.now(),
    };
    socket.emit('video:play', params);
  })
  .on('pause', function() {
    if (!emitPause) return emitPause = true;
    socket.emit('video:pause');
  })
  .on('timeupdate', function() {
    var params = {
      at: $video[0].currentTime, 
      timestamp: Date.now(),
    };
    socket.emit('video:timeupdate', params);
  });

socket
  .on('video:play', function(at) {
    // prevent to re-emit play
    updateCurrentTime(at);
    emitPlay = false;
    $video[0].play();
  })
  .on('video:pause', function() {
    // prevent to re-emit pause
    emitPause = false;
    $video[0].pause();
  })
  .on('video:updatetime', function(at) {
    updateCurrentTime(at);
  })
  .on('video:updatetime', function(params) {
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
