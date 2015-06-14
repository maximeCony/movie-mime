'use strict';

var DustView = require('../components/DustView');
var fullscreenchange = 'webkitfullscreenchange' +
  'mozfullscreenchange' +
  'fullscreenchange';
var ALLOWED_DIFFERENCE = 0.7;
var utils = require('../../lib/utils');
var interact = require('interact.js');

module.exports = DustView.extend({

  el: '#app',

  templateName: 'room/localVideo.dust',

  emitPlay: true,

  emitPause: true,

  setFile: function (file) {
    this.file = file;
  },

  getDustContext: function () {
    return { filename: this.file.name };
  },

  rendered: function () {
    this.$video = this.$el.find('.js-video');
    this.video = this.$video[0];
    this.video.src = URL.createObjectURL(this.file);
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
      // .on(fullscreenchange, this.toogleFullScreen.bind(this));
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

});
