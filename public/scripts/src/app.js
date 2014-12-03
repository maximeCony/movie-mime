'use strict';

var socket = io(),
  _URL = window.URL || window.webkitURL,
  $video = $('#js-video'),
  video = $video[0],
  $handler = $('#js-dragDropFileHandler'),
  $fileName = $('#js-fileName'),
  $usernameInput = $('#usernameInput'),
  $heart = $('.heart'),
  allowedDifference = 0.7,
  emitPlay = true,
  emitPause = true;

var clearAnimateGrowClassTimeout;
var heartBeat = function() {
  $heart.addClass('animate-grow');
  if (clearAnimateGrowClassTimeout) {
    clearTimeout(clearAnimateGrowClassTimeout);
  }
  clearAnimateGrowClassTimeout = setTimeout(function() {
    $heart.removeClass('animate-grow');
  }, 200);
};

var handleFile = function(file) {
  $handler.hide();
  $video.fadeIn();
  var icon = '<span class="glyphicon glyphicon-film"></span> ';
  $fileName
    .html(icon + file.name)
    .fadeIn();
  video.src = _URL.createObjectURL(file);
  heartBeat();
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
    heartBeat();
    if (!emitPlay) return emitPlay = true;
    var params = {
      at: video.currentTime, 
      timestamp: Date.now(),
    };
    socket.emit('video:play', params);
  })
  .on('pause', function() {
    heartBeat();
    if (!emitPause) return emitPause = true;
    socket.emit('video:pause');
  })
  .on('timeupdate', function() {
    var params = {
      at: video.currentTime, 
      timestamp: Date.now(),
    };
    socket.emit('video:timeupdate', params);
  });

socket
  .on('video:play', function(at) {
    updateCurrentTime(at);
    // prevent to re-emit play
    emitPlay = false;
    video.play();
  })
  .on('video:pause', function() {
    // prevent to re-emit pause
    emitPause = false;
    video.pause();
  })
  .on('video:updatetime', function(at) {
    updateCurrentTime(at);
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
