"use strict";
/**
 * Authentication functions for database Users
 */

const User = require("./db.js");
const Utils = require("./user_utils.js")
const Promise = require("bluebird");
const Crypto = require('crypto');

//Convert Crypto functions to user Promises
Promise.promisifyAll(Crypto);

//Promise function to return random salt
function generateSalt() {
    return Crypto.randomBytesAsync(256);
}

//Promise function to return a random auth token
function generateAuthToken() {
    return Crypto.randomBytesAsync(40)
        .then((buf) => {
            return buf.toString('base64');
        });
}

//Returns Map with criteria to check an user with authToken
function authUserCriteria(email, authToken) {
    return {"email": email, "login.auth_tokens.token": authToken};
}

//Tries to login user with email and password
exports.loginUser = function(email, password) {
    let locals = {};
    return User.findOne({ 'email': email}).exec()
        .then(function (user) {
            locals.user = user;
            console.log("User Found");
            return Crypto.pbkdf2Async(password, user.login.salt, 100000, 512, 'sha512');
        }).then(function (hash) {
            if (!locals.user.login.hashed_password.equals(hash)) {
                console.log("Password didn't match");
                return Promise.reject("Password didn't match");
            } else {
                return generateAuthToken();
            }
        }).then(function(authToken) {
            locals.user.login.auth_tokens.push({token: authToken, expire_time: new Date().setFullYear(new Date().getFullYear() + 2)});
            locals.authToken = authToken;
            return locals.user.save();
        }).then(function (user) {
            return [locals.authToken, user];
        });
};

//Register User
exports.registerUser = function registerUser(email, password, first_name, last_name) {
    console.log("Registering user: %s, password: %s, first_name: %s, last_name: %s",
        email, password, first_name, last_name);
    let locals = {};
    return generateSalt()
        .then(function (salt) {
            console.log("salt " + salt);
            locals.salt = salt;
            return Crypto.pbkdf2Async(password, salt, 100000, 512, 'sha512');
        }).then( function (hash) {
            const newUser = User({email: email,
                login: {hashed_password: hash, salt: locals.salt},
                profile: {first_name: first_name, last_name: last_name}
            });
            return newUser.save();
        });
};

//Logout User AuthToken
exports.logoutUser = function(email, authToken) {
    return Utils.updateAuthedUser(email, authToken, {"$pull":{"login.auth_tokens": {"token": authToken}}});
};

//Find Authorized user with Email and AuthToken
exports.findAuthedUser = function(email, authToken, projection) {
    let query = User.findOne(authUserCriteria(email, authToken), projection);
    return query.exec().then(function(user) {
        if (user) {
            return user;
        } else {
            return Promise.reject("Authentication Failed");
        }
    });
};

//Update fields of user with Email and AuthToken
module.exports.updateAuthedUser = function(email, authToken, update) {
    let query = User.findOneAndUpdate(authUserCriteria(email, authToken), update, {new: true});
    return query.exec()
        .then(function(user) {
            if (user) {
                return user;
            } else {
                return Promise.reject("Authentication Failed");
            }
        });
};
