'use strict';

var utils = require('../lib/utils');
var ALLOWED_DIFFERENCE = 0.7;

module.exports = function (roomId, socket) {

  return {

    initialize: function() {
      this.emitPlay = true;
      this.emitPause = true;
      socket.emit('room:join', { roomId: roomId });
      this.$handler = $('#js-dragDropFileHandler');
      this.$fileName = $('#js-fileName');
      $('#js-shareableLink')
        .val('http://localhost:3000/rooms/' + roomId)
        .focus(function () { this.select(); })
        .mouseup(function () { return false; })
        .focus();
      // TODO:
      // this.$usernameInput = $('#usernameInput').focus();
      this.initEvents();
      return this;
    },

    initEvents: function () {
      socket
        .on('video:play', this.receivedPlay.bind(this))
        .on('video:pause', this.receivedPause.bind(this))
        .on('video:updatetime', this.receivedUpdateTime.bind(this));
      $(document)
        .on('dragenter', this.dragenter.bind(this))
        .on('dragover', this.dragover.bind(this))
        .on('dragleave', this.dragleave.bind(this))
        .on('drop', this.drop.bind(this));
      this.$video = $('#js-video')
        .on('play', this.play.bind(this))
        .on('pause', this.pause.bind(this))
        .on('timeupdate', this.timeupdate.bind(this));
      this.video = this.$video[0];
    },

    updateCurrentTime: function(at) {
      var currentTime = this.video.currentTime,
        difference = Math.max(currentTime, at) - Math.min(currentTime, at);
      if (difference > ALLOWED_DIFFERENCE) {
        this.video.currentTime = at;
      }
    },

    handleFile: function(file) {
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
        timestamp: Date.now(),
      };
      socket.emit('video:play', params);
    },

    pause: function() {
      utils.heartBeat();
      if (!this.emitPause) {
        this.emitPause = true;
        return;
      }
      socket.emit('video:pause');
    },

    timeupdate: function() {
      var params = {
        at: this.video.currentTime, 
        timestamp: Date.now(),
      };
      socket.emit('video:timeupdate', params);
    },

    receivedPlay: function(at) {
      this.updateCurrentTime(at);
      // prevent to re-emit play
      this.emitPlay = false;
      this.video.play();
    },

    receivedPause: function() {
      // prevent to re-emit pause
      this.emitPause = false;
      this.video.pause();
    },

    receivedUpdateTime: function(at) {
      this.updateCurrentTime(at);
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