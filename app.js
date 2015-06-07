'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var dustjs = require('adaro');
var socketModule = require('./server/modules/socket-module');
var webModule = require('./server/modules/web-module');
var isProduction = process.env.NODE_ENV === 'production';
var expressPeerServer = require('peer').ExpressPeerServer;

app.use('/public', express.static(__dirname + '/public'));

// dust
app.engine('dust', dustjs.dust({
  cache: isProduction,
}));
app.set('view engine', 'dust');
app.set('views', __dirname + '/server/views');

// parse body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routing
app.use('/peerjs', expressPeerServer(http));
app.use(webModule);
socketModule(io);

http.listen(process.env.PORT, function () {
  console.log('listening on port '+ process.env.PORT);
});
