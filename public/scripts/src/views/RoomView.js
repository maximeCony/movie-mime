'use strict';

var utils = require('../lib/utils');
var ALLOWED_DIFFERENCE = 0.7;
var peers = require('../lib/peers');

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
      this.$camsContainer = $('#cams-container');
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

    initEvents: function () {
      var me = this;
      this.eventsInitialized = true;
      peers
        .on('video:play', this.receivedPlay.bind(this))
        .on('video:pause', this.receivedPause.bind(this))
        .on('video:timeupdate', this.receivedTimeUpdate.bind(this))
        .on('call:local', function (stream) {
          me.$backdrop.addClass('is-hidden');
          me.$callBtn
            .removeClass('btn-success')
            .addClass('btn-info')
            .text('Calling...');
          $('#my-video').prop('src', URL.createObjectURL(stream));
        })
        .on('call:remote', function (stream) {
          me.$callBtn.addClass('is-hidden');
          me.$hangupBtn.removeClass('is-hidden');
          me.$movieContainer.removeClass('col-md-12').addClass('col-md-10');
          me.$camsContainer.removeClass('is-hidden');
          $('#their-video').prop('src', URL.createObjectURL(stream));
        })
        .on('confirmCamAccess', function () {
          me.$backdrop.removeClass('is-hidden');
        });
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
      this.$callBtn.click(peers.call);
      this.$hangupBtn.click(peers.hangup);
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