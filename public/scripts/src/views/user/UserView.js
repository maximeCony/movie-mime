'use strict';

var DustView = require('../components/DustView');
var utils = require('../../lib/utils');

module.exports = DustView.extend({

  templateName: 'user/user.dust',

  events: {
    'click .js-call': 'ring',
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
        .text('Calling...');
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
          me.call.on('stream', me.onCall.bind(me));
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
        me.call = APP.peer
          .call(params.peerId, stream)
          .on('stream', me.onCall.bind(me));
      }, console.error);
    });
  },

  onCall: function (remoteStream) {
    this.$theirVideoSection
      .removeClass('is-hidden')
      .find('video')
      .prop('src', URL.createObjectURL(remoteStream));
  },

});
