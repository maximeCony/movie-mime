'use strict';

var DustView = require('../components/DustView');
var fullscreenchange = 'webkitfullscreenchange ' +
  'mozfullscreenchange ' +
  'fullscreenchange';
var ALLOWED_DIFFERENCE = 0.7;
var utils = require('../../lib/utils');
var interact = require('interact.js');

module.exports = DustView.extend({

  el: '#app',

  templateName: 'room/localVideo.dust',

  emitPlay: true,

  emitPause: true,

  getDustContext: function () {
    return {
      filename: this.videoFile.name,
      videoUrl: this.videoFile ?
        URL.createObjectURL(this.videoFile) : null,
      subtitleUrl: this.subtitleFile ?
        URL.createObjectURL(this.subtitleFile) : null,
    };
  },

  rendered: function () {
    this.$video = this.$el.find('.js-video');
    this.video = this.$video[0];
    this.initEvents();
  },

  initEvents: function () {
    APP.socket
      .on('moviemime:video:play', this.receivedPlay.bind(this))
      .on('moviemime:video:pause', this.receivedPause.bind(this))
      .on('moviemime:video:updatetime', this.receivedUpdateTime.bind(this));
    this.$video
      .on('play', this.play.bind(this))
      .on('pause', this.pause.bind(this))
      .on('seeked', this.seeked.bind(this))
      .on(fullscreenchange, this.toogleFullScreen.bind(this));
  },

  isTimeUpdateRequired: function(at) {
    var max = Math.max(at, this.video.currentTime);
    var min = Math.min(at, this.video.currentTime);
    var difference = max - min;
    return difference > ALLOWED_DIFFERENCE;
  },

  receivedPlay: function(params) {
    if (this.isTimeUpdateRequired(params.at)) {
      this.video.currentTime = params.at;
    }
    // prevent to re-emit play
    this.emitPlay = false;
    this.video.play();
  },

  receivedPause: function() {
    // prevent to re-emit pause
    this.emitPause = false;
    this.video.pause();
  },

  receivedUpdateTime: function(params) {
    if (this.isTimeUpdateRequired(params.at)) {
      this.video.currentTime = params.at;
    }
  },

   play: function() {
    utils.heartBeat();
    if (!this.emitPlay) {
      this.emitPlay = true;
      return;
    }
    APP.socket.emit('moviemime:video:play', {
      at: this.video.currentTime,
    });
  },

  pause: function() {
    utils.heartBeat();
    if (!this.emitPause) {
      this.emitPause = true;
      return;
    }
    APP.socket.emit('moviemime:video:pause');
  },

  seeked: function() {
    APP.socket.emit('moviemime:video:seeked', {
      at: this.video.currentTime,
    });
  },

  toogleFullScreen: function () {
    var isFullScreen = (
      document.fullScreen || 
      document.mozFullScreen || 
      document.webkitIsFullScreen
    );
    var $videos = $('.js-userVideo');
    if (isFullScreen) {
      $videos.addClass('full-screen-video');
      interact('.full-screen-video')
        .draggable({ 
          inertia: true,
          onmove: this.dragMoveListener,
        })
        .resizable({
          edges: { left: true, right: true, bottom: false, top: false },
        })
        .on('resizemove', this.resizeMove);
    } else {
      $videos.removeClass('full-screen-video');
    }
  },

  resizeMove: function (e) {
    var target = e.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0);
    var y = (parseFloat(target.getAttribute('data-y')) || 0);
    // update the element's style
    target.style.width  = e.rect.width + 'px';
    // target.style.height = e.rect.height + 'px';
    // translate when resizing from top or left edges
    x += e.deltaRect.left;
    target.style.webkitTransform = 
      target.style.transform =
      'translate(' + x + 'px,' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.textContent = e.rect.width + '×' + e.rect.height;
  },

  dragMoveListener: function (e) {
    var target = e.target;
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;
    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  },

});
