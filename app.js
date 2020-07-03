const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
var routes = require('./routes');
const connection = require('./config/database');

const {issueJWT} = require('./lib/jwtUtils');

// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo')(session);

// Need to require the entire Passport config module so app.js knows about it
require('./config/passport');

/**
 * 01 -------------- GENERAL SETUP ----------------
 */


// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
var app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));


/**
 * 02 -------------- SESSION SETUP ----------------
 */

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));




/**
 * 03 -------------- PASSPORT AUTHENTICATION ----------------
 */

 // Need to require the entire Passport config module so app.js knows about it
require('./config/passport');

app.use(passport.initialize());

require('./config/passport-jwt')(passport);

//gives access to req.session...
app.use(passport.session());



app.use((req, res, next) => {
    console.log('THE SESSION:', req.session);
    console.log('THE USER:', req.user);  
    // console.log('THE USER ID:',  req.session.passport.user);  
    next();
});






/**
 * 04 -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(routes);

let user = {
    "_id": "5effa19748d9de2e68c0c6c6"
}
issueJWT(user);

const errHandler = (err, req, res, next) =>{
    if(err){
  console.log('Error Occured:', err)
  res.status(500).json({message: 'Oopps..!! An Error Has Occured, Try again later.'})
    }
}
app.use(errHandler);





/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000 
var SERVER = app.listen(process.env.PORT || 3001,  process.env.ADDRESS || '127.0.0.1',  () => {
    let port = SERVER.address().port
    let host = SERVER.address().address
    console.log(`Server running on:  http://${host}:${port}`);
});