'use strict';

var utils = require('../lib/utils');
var ALLOWED_DIFFERENCE = 0.7;
var peers = require('../lib/peers');
var interact = require('interact.js');
var room = require('../lib/room');
var fullscreenchange = [
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'fullscreenchange',
].join(' ');

module.exports = function () {

  return {

    eventsInitialized: false,

    initialize: function() {
      this.emitPlay = true;
      this.emitPause = true;
      this.$handler = $('#js-dragDropFileHandler');
      this.$fileName = $('#js-fileName');
      this.$backdrop = $('.backdrop');
      this.$callBtn = $('.js-call');
      this.$hangupBtn = $('.js-hangup');
      this.$movieContainer = $('#movie-container');
      this.$camsContainer = $('.cams-container');
      this.$theirVideo = $('#their-video');
      var parser = document.createElement('a');
      parser.href = window.location.href;
      $('#js-shareableLink')
        .val(
          parser.protocol + '//' + parser.hostname +
          (parser.port ? ':' + parser.port : '') +
          '/rooms/' + window.ROOM_ID
        )
        .focus(function () { this.select(); })
        .mouseup(function () { return false; })
        .focus();
      peers.on('connexion:connected', this.newUserConnected.bind(this));
      return this;
    },

    newUserConnected: function () {
      if (!this.eventsInitialized) this.initEvents();
      $('#step-2').removeClass('is-hidden');
      $('#step-1').addClass('is-hidden');
    },

    calling: function (stream) {
      this.$backdrop.addClass('is-hidden');
      this.$callBtn
        .removeClass('btn-success')
        .addClass('btn-info')
        .text('Calling...');
      $('#my-video').prop('src', URL.createObjectURL(stream));
    },

    callReceived: function (stream) {
      this.$callBtn.addClass('is-hidden');
      this.$hangupBtn.removeClass('is-hidden');
      this.$movieContainer.removeClass('col-md-12').addClass('col-md-10');
      this.$camsContainer.removeClass('is-hidden');
      $('#their-video').prop('src', URL.createObjectURL(stream));
    },

    cameraGranted: function () {
      this.$backdrop.removeClass('is-hidden');
    },

    initEvents: function () {
      this.eventsInitialized = true;
      this.$video = $('#js-video');
      this.video = this.$video[0];
      room.socket
        .on('moviemime:video:play', this.receivedPlay.bind(this))
        .on('moviemime:video:pause', this.receivedPause.bind(this))
        .on('moviemime:video:timeupdate', this.receivedTimeUpdate.bind(this));
      $(document)
        .on('dragenter', this.dragenter.bind(this))
        .on('dragover', this.dragover.bind(this))
        .on('dragleave', this.dragleave.bind(this))
        .on('drop', this.drop.bind(this));
      this.$video
        .on('play', this.play.bind(this))
        .on('pause', this.pause.bind(this))
        .on('seeked', this.timeupdate.bind(this))
        .on(fullscreenchange, this.toogleFullScreen.bind(this));
      peers
        .on('moviemime:call:local', this.calling.bind(this))
        .on('moviemime:call:remote', this.callReceived.bind(this))
        .on('moviemime:camera:granted', this.cameraGranted.bind(this));
      this.$callBtn.on('click', peers.call);
      this.$hangupBtn.on('click', peers.hangup);
    },

    toogleFullScreen: function () {
      var isFullScreen = (
        document.fullScreen || 
        document.mozFullScreen || 
        document.webkitIsFullScreen
      );
      if (isFullScreen) {
        this.$theirVideo.addClass('full-screen-video');
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
        this.$theirVideo.removeClass('full-screen-video');
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

    updateCurrentTime: function(at) {
      var currentTime = this.video.currentTime,
        difference = Math.max(currentTime, at) - Math.min(currentTime, at);
      if (difference > ALLOWED_DIFFERENCE) {
        this.video.currentTime = at;
      }
    },

    handleFile: function(file) {
      $('.js-call').removeClass('is-hidden');
      this.$handler.hide();
      this.$video.fadeIn();
      var icon = '<span class="glyphicon glyphicon-film"></span> ',
        _URL = window.URL || window.webkitURL;
      this.$fileName
        .html(icon + file.name)
        .fadeIn();
      this.video.src = _URL.createObjectURL(file);
      utils.heartBeat();
    },

    play: function() {
      utils.heartBeat();
      if (!this.emitPlay) {
        this.emitPlay = true;
        return;
      }
      var params = {
        at: this.video.currentTime,
      };
      room.socket.emit('moviemime:video:play', params);
    },

    pause: function() {
      utils.heartBeat();
      if (!this.emitPause) {
        this.emitPause = true;
        return;
      }
      room.socket.emit('moviemime:video:pause');
    },

    timeupdate: function() {
      var params = {
        at: this.video.currentTime,
      };
      room.socket.emit('moviemime:video:timeupdate', params);
    },

    receivedPlay: function(params) {
      this.updateCurrentTime(params.at);
      // prevent to re-emit play
      this.emitPlay = false;
      this.video.play();
    },

    receivedPause: function() {
      // prevent to re-emit pause
      this.emitPause = false;
      this.video.pause();
    },

    isTimeUpdateRequired: function(at) {
      var max = Math.max(at, this.video.currentTime);
      var min = Math.min(at, this.video.currentTime);
      var difference = max - min;
      return difference > ALLOWED_DIFFERENCE;
    },

    receivedTimeUpdate: function(params) {
      if (this.isTimeUpdateRequired(params.at)) {
        this.updateCurrentTime(params.at);
      }
    },

    dragenter: function(e) {
      e.stopPropagation();
      e.preventDefault();
    },

    dragover: function(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$handler.addClass('fileHandler-dragOver');
    },

    dragleave: function(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$handler.removeClass('fileHandler-dragOver');
    },

    drop: function(e) {
      e.stopPropagation();
      e.preventDefault();
      var files = e.originalEvent.dataTransfer.files;
      this.handleFile(files[0]);
    },

  };

};