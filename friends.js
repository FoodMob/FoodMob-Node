"use strict";
const Promise = require("bluebird");
const Auth = require("./auth.js");
const UserUtils = require("./user_utils");

module.exports.getFriends = function(email, authToken) {
    return Auth.findAuthedUser(email, authToken)
        .then(function(user) {
            return user.friends;
        })
};

module.exports.addFriend = function(userEmail, authToken, friendEmail) {
    let locals = {};
    return Auth.findAuthedUser(userEmail, authToken)
        .then(function (user) {
            let friends = user.friends;
            if (friends.some(friend => friend.email == friendEmail)) {
                return Promise.reject("Friend already added");
            } else {
                locals.user = user;
                return UserUtils.getUserProfile(friendEmail);
            }
        }).then(function (profile) {
            console.log(profile);
            let first_name = profile.first_name;
            let last_name = profile.last_name;
            let email = friendEmail;
            locals.user.friends.push({first_name: first_name, last_name: last_name, email: email});
            return locals.user.save();
        })
};