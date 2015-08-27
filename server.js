/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2015 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////

var credentials = require('./config/credentials');
var ViewAndDataClient = require('./routes/view-and-data-client');

var viewAndDataClient = new ViewAndDataClient(
  credentials.BaseUrl,
  credentials.ConsumerKey,
  credentials.SecretKey);

var collaboration = require('./routes/collaboration');
var dbConnector = require('./routes/dbConnector');
var config = require('./config/config-server');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var passport = require('passport');
var express = require('express');

var app = express();

app.use(config.host, express.static(__dirname + '/www'));
app.use(favicon(__dirname + '/www/img/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session(
  {
    //Randomly generated GUID
    secret: '352EB973-A522-4362-87C0-4A87A7A8D33D',
    saveUninitialized: true,
    resave: false
  }));

//Middlewares
app.use(passport.initialize());
app.use(passport.session());

//Apps
app.use(config.host + '/embed', express.static(
  __dirname + '/www/js/apps/embed/embed.html'));

app.use(config.host + '/collaboration', express.static(
  __dirname + '/www/js/apps/collaboration/collaboration.html'));

var connector = new dbConnector(config);

connector.initializeDb(

  function(db){

    app.use(config.host + '/api/auth', require('./routes/api/auth')(db));
    app.use(config.host + '/api/states', require('./routes/api/states')(db));
    app.use(config.host + '/api/extensions', require('./routes/api/extensions')(db));
    app.use(config.host + '/api/thumbnails', require('./routes/api/thumbnails')(db));

    viewAndDataClient.onInitialized(function() {

      app.use(config.host + '/api/token', require('./routes/api/token')(viewAndDataClient));
      app.use(config.host + '/api/models', require('./routes/api/models')(db, viewAndDataClient));

      //tools API only for dev
      //app.use(config.host + '/api/tools', require('./routes/api/tools')(db, viewAndDataClient));
    });

  }, function(error) {

    console.log(error);
  });

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {

  new collaboration(server, 5002);

  console.log('Server listening on port ' +
    server.address().port);
});

function checkAuth(req, res, next){

  if(req.user)
    next();
  else {
    res.status(401);
    return res.send('You are not authorized to view this page');
  }
}