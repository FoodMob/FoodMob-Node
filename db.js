"use strict";
/**
 * Database API for UserSchema
 */

const Promise = require("bluebird");
const mongoose = require('mongoose');
//Set Mongoose to return bluebird promises
mongoose.Promise = Promise;

// Connection URL. This is where your mongodb server is running.
const dbURI = 'mongodb://foodmob:foodmob@ds059215.mongolab.com:59215/food_mob';
//var dbURI = 'mongodb://localhost:27017/food_mob';

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

//Disconnect when process ends
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

//Connects to MongoDb databse
mongoose.connect(dbURI);

// create and export Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    login: {
        hashed_password: { type: Buffer, required: true },
        salt: {type: Buffer, required: true},
        auth_tokens: [{
            token: {type: String, required: true},
            expire_time: Date
        }]
    },
    profile: {
        first_name: { type: String, required: true},
        last_name: { type: String, required: true}
    },
    food_profile: {
        likes: [String],
        dislikes: [String],
        allergies: [String]
    },
    friends: [{
        first_name: { type: String, required: true},
        last_name: { type: String, required: true},
        email: { type: String, required: true, unique: true }
    }]
});

//Export User Model
module.exports = mongoose.model('users', userSchema);