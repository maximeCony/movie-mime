'use strict';

var socket = io(),
  _URL = window.URL || window.webkitURL,
  $videoContainer = $('#video-container'),
  $video = $('#js-video'),
  video = $video[0],
  $videoCurrentTime = $('.js-videoCurrentTime'),
  $videoControls = $('#video-controls'),
  $playPauseVideo = $('.js-playPauseVideo'),
  $muteVideo = $('.js-muteVideo'),
  $fullScreenVideo = $('.js-fullScreenVideo'),
  $seekVideo = $('.js-seekVideo'),
  $setVolumeVideo = $('.js-setVolumeVideo'),
  $handler = $('#js-dragDropFileHandler'),
  $fileName = $('#js-fileName'),
  $usernameInput = $('#usernameInput'),
  $heart = $('.heart'),
  allowedDifference = 0.7;

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
  $videoContainer.fadeIn();
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

var playPause = function() {
  if (video.paused !== true) {
    return socket.emit('video:pause');
  }
  socket.emit('video:play', {
    at: video.currentTime, 
    timestamp: Date.now(),
  });
};

// hide/show controls on full screen

var hideAfter = 4,
  inactivityTimer = 0;

var showFullScreenControls = function() {
  inactivityTimer = 0;
  $videoControls.show();
};

var toogleFullScreenControls = function() {
  inactivityTimer++;
  if (inactivityTimer >= hideAfter) {
    $videoControls.hide();
  }
};

$(document)
  .on('click', showFullScreenControls)
  .on('mousemove', showFullScreenControls)
  .on('keyup', showFullScreenControls);

var toogleFullScreenControlsInterval;

// fullscreen

var toogleFullScreen = function() {
  if (!document.fullscreenElement &&
      !document.mozFullScreenElement && 
      !document.webkitFullscreenElement && 
      !document.msFullscreenElement ) {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) {
      video
        .webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    toogleFullScreenControlsInterval = window
      .setInterval(toogleFullScreenControls, 1000);
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    clearInterval(toogleFullScreenControlsInterval);
  }
};

$video
  .on('play', function() {
    $playPauseVideo
      .find('span')
      .addClass('glyphicon-pause')
      .removeClass('glyphicon-play');
    heartBeat();
  })
  .on('pause', function() {
    $playPauseVideo.find('span')
      .addClass('glyphicon-play')
      .removeClass('glyphicon-pause');
    heartBeat();  
  })
  .on('timeupdate', function() {
    var date = new Date(null);
    date.setSeconds(video.currentTime);
    $videoCurrentTime.text(date.toISOString().substr(11, 8));
    if (video.seeking) return;
    var value = (10000 * video.currentTime) / video.duration;
    $seekVideo.val(value);
    socket.emit('video:timeupdate', {
      at: $video[0].currentTime, 
      timestamp: Date.now(),
    });
  });

$playPauseVideo
  .on('click', playPause);

$muteVideo
  .on('click', function() {
    if (video.muted === false) {
      video.muted = true;
      $muteVideo
        // .button('toggle')
        .addClass('btn-danger')
        .removeClass('btn-default');
    } else {
      video.muted = false;
      $muteVideo
        // .button('reset')
        .removeClass('btn-danger')
        .addClass('btn-default');
    }
  });

$setVolumeVideo
  .on('change', function() {
    video.volume = $setVolumeVideo.val();
  });

$fullScreenVideo
  .on('click', toogleFullScreen);

$seekVideo
  .on('change', function() {
    socket.emit('video:seek', {
      at: ($seekVideo.val() * video.duration) / 10000, 
      timestamp: Date.now(),
    });
  })
  .on('mousedown', function() {
    video.pause();
  })
  .on('mouseup', function() {
    video.play();
  });

socket
  .on('video:play', function(at) {
    updateCurrentTime(at);
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
  .on('keyup', function(e) {
    if (e.which === 32) playPause();
  })
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
