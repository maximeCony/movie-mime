'use strict';

var express = require('express');
var Room = require('../../model/room');
var router = express.Router();

var renderRooms = function (req, res) {
  res.render('rooms');
};

var renderRoom = function (req, res) {
  res.render('room');
};

var getRooms = function(req, res, next) {
  Room.find(function(err, rooms) {
    if (err) return next(err);
    res.json(rooms);
  });
};

var createRoom = function(req, res, next) {
  var name = req.body.name,
    // password = req.body.password,
    err;
  if (!name) {
    err = new Error('Missing param name');
    err.status = 400;
    return next(err);
  }
  // if (!password) {
  //   err = new Error('Missing param password');
  //   err.status = 400;
  //   return next(err);
  // }
  var room = new Room({
    name: name,
    // password: password,
  });
  room.save(function(err) {
    if (err) return next(err);
    res.json(room);
  });
};

var requireRoom = function(req, res, next) {
  Room.findById(req.params.roomId, function(err, room) {
    if (err) return next(err);
    res.json(room);
  });
};

var deleteRoom = function(req, res, next) {
  res.locals.room.remove(function(err) {
    if (err) return next(err);
    res.json(res.locals.room);
  });
};

var updateRoom = function(req, res, next) {
  var name = req.param('name'),
    password = req.param('password'),
    attributes = {};
  if (!name) {
    attributes.name = name;
  }
  if (!password) {
    attributes.password = password;
  }
  res.locals.room.update(attributes, null, function(err) {
    if (err) return next(err);
    res.json(res.locals.room);
  });
};

router
  .route('/rooms')
  .get(renderRooms);

router
  .route('/room')
  .get(renderRoom);

router
  .route('/api/rooms')
  .get(getRooms)
  .post(createRoom);

router
  .route('/api/rooms/:room_id')
  .delete(requireRoom, deleteRoom)
  .put(requireRoom, updateRoom);

module.exports = router;
