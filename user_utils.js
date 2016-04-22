"use strict";
const Promise = require("bluebird");
const User = require("./db.js");
const Auth = require("./auth.js");

module.exports.findUser = function(email) {
    return User.findOne({"email": email});
};

module.exports.getUserProfile = function(email) {
    return module.exports.findUser(email)
        .then(user => user.profile);
};

module.exports.updateUserFoodProfile = function(email, authToken, foodProfile) {
    return Auth.updateAuthedUser(email, authToken, {"$set":{"food_profile":foodProfile}});
};

module.exports.getUserFoodProfile = function(email, authToken, foodProfile) {
    return Auth.findAuthedUser(email, authToken, {food_profile: true})
        .then(function(user) {
            return user.food_profile;
        });
};