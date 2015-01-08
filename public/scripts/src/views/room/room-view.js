'use strict';

var services = require('../../services'),
  allowedDifference = 0.7;

module.exports = Backbone.View.extend({

  el: '#app',

  template: _.template($('#room-template').html()),

  initialize: function() {
    this.emitPlay = true;
    this.emitPause = true;
    APP.socket
      .on('video:play', this.receivedPlay.bind(this))
      .on('video:pause', this.receivedPause.bind(this))
      .on('video:updatetime', this.receivedUpdateTime.bind(this));
    $(document)
      .on('dragenter', this.dragenter.bind(this))
      .on('dragover', this.dragover.bind(this))
      .on('dragleave', this.dragleave.bind(this))
      .on('drop', this.drop.bind(this));
  },

  render: function() {
    this.$el.html(this.template({
      room: this.model.toJSON(),
    }));
    this.$video = this.$el.find('#js-video')
      .on('play', this.play.bind(this))
      .on('pause', this.pause.bind(this))
      .on('timeupdate', this.timeupdate.bind(this));
    this.video = this.$video[0];
    this.$handler = this.$el.find('#js-dragDropFileHandler');
    this.$fileName = this.$el.find('#js-fileName');
    this.$usernameInput = this.$el
      .find('#usernameInput')
      .focus();
    return this;
  },

  updateCurrentTime: function(at) {
    var currentTime = this.video.currentTime,
      difference = Math.max(currentTime, at) - Math.min(currentTime, at);
    if (difference > allowedDifference) {
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
    services.heartBeat();
  },

  play: function() {
    services.heartBeat();
    if (!this.emitPlay) return this.emitPlay = true;
    var params = {
      at: this.video.currentTime, 
      timestamp: Date.now(),
    };
    APP.socket.emit('video:play', params);
  },

  pause: function() {
    services.heartBeat();
    if (!this.emitPause) return this.emitPause = true;
    APP.socket.emit('video:pause');
  },

  timeupdate: function() {
    var params = {
      at: this.video.currentTime, 
      timestamp: Date.now(),
    };
    APP.socket.emit('video:timeupdate', params);
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


});