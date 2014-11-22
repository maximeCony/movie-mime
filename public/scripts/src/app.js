'use strict';

var socket = io(),
  _URL = window.URL || window.webkitURL,
  $video = $('#js-video'),
  $handler = $('#js-dragDropFileHandler'),
  $fileName = $('#js-fileName'),
  allowedDifference = 0.7,
  emitPlay = true,
  emitPause = true;

var handleFile = function(file) {
  $handler.hide();
  $video.fadeIn();
  $fileName.text(file.name);
  $video[0].src = _URL.createObjectURL(file);
};

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

// Drag and drop

$handler
  .on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).css('border', '2px dotted');
  })
  .on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
  })
  .on('drop', function(e) {
    // $(this).css('border', '2px dotted');
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;
    handleFile(files[0]);
  });

$(document)
  .on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
  })
  .on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    // $handler.css('border', '2px dotted');
  })
  .on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
  });
