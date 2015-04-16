(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/apps/app.js":[function(require,module,exports){
'use strict';

$(function() {

  var AppRouter = require('../routers/app-router');

  var APP = window.APP = {
    models: {},
    collections: {},
    views: {},
    socket: io(),
  };

  APP.router = new AppRouter();
  APP.router.start();
});
},{"../routers/app-router":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/routers/app-router.js"}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/collections/room-collection.js":[function(require,module,exports){
'use strict';

var RoomModel = require('../models/room-model');

module.exports = Backbone.Collection.extend({

  model: RoomModel,

  url: 'api/rooms',

});
},{"../models/room-model":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/models/room-model.js"}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/lib/utils.js":[function(require,module,exports){
'use strict';

var animateGrowClassTimeout;

module.exports = {

  heartBeat: function() {
    var $heart = $('.heart');
    $heart.addClass('animate-grow');
    if (animateGrowClassTimeout) {
      clearTimeout(animateGrowClassTimeout);
    }
    animateGrowClassTimeout = setTimeout(function() {
      $heart.removeClass('animate-grow');
    }, 200);
  },

  serializeForm: function($from) {
    return _.object(
      _.map($from.serializeArray(), function(object) {
        return [
          object.name, 
          object.value === '' ? null : object.value,
        ];
      })
    );
  },

};
},{}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/models/room-model.js":[function(require,module,exports){
'use strict';

module.exports = Backbone.Model.extend({

  idAttribute: '_id',

  urlRoot: 'rooms',
  
});

},{}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/routers/app-router.js":[function(require,module,exports){
'use strict';

var UserFormView = require('../views/user/user-form-view'),
  RoomCollection = require('../collections/room-collection'),
  RoomsView = require('../views/room/rooms-view'),
  RoomView = require('../views/room/room-view');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'index',
    'user': 'user',
    'rooms': 'rooms',
    'rooms/:roomId': 'room',
  },

  start: function() {
    this.listenToSocket();
    var username = localStorage.getItem('movie-mime-username');
    if (!username || username === 'undefined') {
      Backbone.history.start({
        silent: window.location.hash !== '#user',
      });
      return this.navigate('user', { trigger: true });
    }
    APP.models.user = new Backbone.Model({ username: username });
    Backbone.history.start();
  },

  listenToSocket: function() {
    this.listenTo(APP.socket, 'room:joined', this.roomJoined.bind(this));
  },

  roomJoined: function(params) {
    this.navigate('rooms/' + params.roomId, { trigger:true });
  },

  index: function() {
    this.navigate('rooms', { trigger: true });
  },

  user: function() {
    APP.views.userFormView = new UserFormView().render();
  },

  rooms: function() {
    APP.collections.rooms = new RoomCollection();
    APP.views.roomsView = new RoomsView({
      collection: APP.collections.rooms,
    });
    APP.collections.rooms.fetch({ reset: true });
  },

  room: function(roomId) {
    var room = APP.collections.rooms.get(roomId);
    APP.views.roomView = new RoomView({
      model: room,
    }).render();
  },  

});
},{"../collections/room-collection":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/collections/room-collection.js","../views/room/room-view":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/room/room-view.js","../views/room/rooms-view":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/room/rooms-view.js","../views/user/user-form-view":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/user/user-form-view.js"}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/components/dust-view.js":[function(require,module,exports){
'use strict';

module.exports = Backbone.View.extend({

  templateName: undefined,

  getDustContext: function() {
    return {};
  },

  render: function() {
    var me = this;
    dust.render(this.templateName, this.getDustContext(), function(err, out) {
      if (err) return console.error(err);
      me.$el.html(out);
      if (me.rendered) me.rendered();
    });
    return this;
  },

});
},{}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/room/room-row-view.js":[function(require,module,exports){
'use strict';

var DustView = require('../components/dust-view');

module.exports = DustView.extend({

  templateName: 'room-row',

  className: 'room-row',

  events: {
    'click': 'joinRoom',
  },

  getDustContext: function() {
    return {
      room: this.model.toJSON(),
    };
  },

  joinRoom: function() {
    window.location.href = '/rooms/' + this.model.id;
  },

});
},{"../components/dust-view":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/components/dust-view.js"}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/room/room-view.js":[function(require,module,exports){
'use strict';

var utils = require('../../lib/utils'),
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
    utils.heartBeat();
  },

  play: function() {
    utils.heartBeat();
    if (!this.emitPlay) return this.emitPlay = true;
    var params = {
      at: this.video.currentTime, 
      timestamp: Date.now(),
    };
    APP.socket.emit('video:play', params);
  },

  pause: function() {
    utils.heartBeat();
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
},{"../../lib/utils":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/lib/utils.js"}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/room/rooms-view.js":[function(require,module,exports){
'use strict';

var RoomRowView = require('./room-row-view');
var utils = require('../../lib/utils');

module.exports = Backbone.View.extend({

  el: 'body',

  events: {
    'click .js-createRoomModal': 'createRoomModal',
    'submit .js-createRoomForm': 'createRoom',
  },

  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.addOne);
    this.$rows = this.$el.find('.js-rooms');
    this.$createRoomModal = $('#js-createRoomModal');
  },

  addOne: function(model) {
    var view = new RoomRowView({ model: model });
    this.$rows.append(view.render().$el.fadeIn());
  },

  render: function() {
    this.$rows.html('');
    this.collection.forEach(this.addOne, this);
    return this;
  },

  createRoomModal: function() {
    this.$createRoomModal.modal('show');
  },

  createRoom: function(e) {
    e.preventDefault();
    var attributes = utils.serializeForm($(e.currentTarget)),
      me = this;
    this.collection.create(attributes, {
      wait: true,
      error: function () {
        // TODO: alert
      },
      success: function () {
        me.$createRoomModal.modal('hide');
      },
    });
  },

});
},{"../../lib/utils":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/lib/utils.js","./room-row-view":"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/room/room-row-view.js"}],"/Users/maximecony/Documents/node/movie-mime/public/scripts/src/views/user/user-form-view.js":[function(require,module,exports){
'use strict';

module.exports = Backbone.View.extend({

  el: '#app',

  template: _.template($('#user-form-template').html()),

  events: {
    'click #js-saveUser': 'saveUser',
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  saveUser: function() {
    var username = this.$el.find('#username-input').val();
    localStorage.setItem('movie-mime-username', username);
    APP.router.navigate('rooms', { trigger: true });
  },

});
},{}]},{},["/Users/maximecony/Documents/node/movie-mime/public/scripts/src/apps/app.js"]);
