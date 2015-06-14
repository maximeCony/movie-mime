'use strict';

var DustView = require('../components/DustView');
var utils = require('../../lib/utils');

module.exports = DustView.extend({

  templateName: 'user/user.dust',

  events: {
    'click .js-call': 'ring',
    'click .js-hangup': 'hangup',
  },

  initialize: function () {
    this.listenTo(this.model, 'remove', this.remove);
    this.$backdrop = $('.backdrop');
    this.$myVideo = $('.js-myVideo');
    APP.socket.on('moviemime:ring:' + this.model.id, this.answer.bind(this));
  },

  getDustContext: function() {
    return {
      user: this.model.toJSON(),
    };
  },

  rendered: function () {
    this.$callBtn = this.$el.find('.js-call');
    this.$theirVideoSection = this.$el.find('.js-theirVideo-section');
  },

  ring: function () {
    var me = this;
    this.$backdrop.removeClass('is-hidden');
    navigator.getUserMedia(utils.getMediaStreamConstaints(), function (stream) {
      APP.localMediaStream = stream;
      me.$backdrop.addClass('is-hidden');
      me.$callBtn
        .removeClass('btn-success')
        .addClass('btn-info')
        .button('Calling...');
      me.$myVideo.prop('src', URL.createObjectURL(stream));
      APP.peer = new window.Peer(utils.getPeerOptions());
      APP.peer
        .on('open', function (peerId) {
          APP.socket.emit('moviemime:ring', {
            peerId: peerId,
            userId: me.model.id,
          });
        })
        .on('call', function (call) {
          me.call = call;
          me.call.answer(APP.localMediaStream);
          me.initCallListeners();
        });
    }, console.error);
  },

  answer: function (params) {
    var me = this;
    APP.peer = new window.Peer(utils.getPeerOptions());
    APP.peer.on('open', function () {
      me.$backdrop
        .removeClass('is-hidden')
        .html(params.user.name + ' is calling you.');
      var options = utils.getMediaStreamConstaints();
      navigator.getUserMedia(options, function (stream) {
        APP.localMediaStream = stream;
        me.$backdrop.addClass('is-hidden');
        me.$myVideo.prop('src', URL.createObjectURL(stream));
        me.call = APP.peer.call(params.peerId, stream);
        me.initCallListeners();
      }, console.error);
    });
  },

  onCall: function (remoteStream) {
    this.$callBtn
      .removeClass('btn-info')
      .addClass('btn-success is-hidden')
      .button('reset');
    this.$theirVideoSection
      .removeClass('is-hidden')
      .find('video')
      .prop('src', URL.createObjectURL(remoteStream));
  },

  hangup: function () {
    this.call.close();
    this.resetView();
  },

  resetView: function () {
    this.$callBtn.removeClass('is-hidden');
    this.$theirVideoSection.addClass('is-hidden');
  },

  onCallError: function () {
    // TODO:
    console.error('Something went wrong.');
    this.resetView();
  },

  initCallListeners: function () {
    this.call
      .on('stream', this.onCall.bind(this))
      .on('close', this.resetView.bind(this))
      .on('error', this.onCallError.bind(this));
  },

});
