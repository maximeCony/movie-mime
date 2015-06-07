'use strict';

var utils = require('../lib/utils');
var ALLOWED_DIFFERENCE = 0.7;
var peers = require('../lib/peers');

module.exports = function () {

  return {

    initialize: function() {
      this.emitPlay = true;
      this.emitPause = true;
      this.$handler = $('#js-dragDropFileHandler');
      this.$fileName = $('#js-fileName');
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
      this.initEvents();
      return this;
    },

    initEvents: function () {
      peers
        .on('video:play', this.receivedPlay.bind(this))
        .on('video:pause', this.receivedPause.bind(this))
        .on('video:timeupdate', this.receivedTimeUpdate.bind(this));
      $(document)
        .on('dragenter', this.dragenter.bind(this))
        .on('dragover', this.dragover.bind(this))
        .on('dragleave', this.dragleave.bind(this))
        .on('drop', this.drop.bind(this));
      this.$video = $('#js-video')
        .on('play', this.play.bind(this))
        .on('pause', this.pause.bind(this))
        .on('seeked', this.timeupdate.bind(this));
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
      };
      peers.emit('video:play', params);
    },

    pause: function() {
      utils.heartBeat();
      if (!this.emitPause) {
        this.emitPause = true;
        return;
      }
      peers.emit('video:pause');
    },

    timeupdate: function() {
      var params = {
        at: this.video.currentTime,
      };
      peers.emit('video:timeupdate', params);
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