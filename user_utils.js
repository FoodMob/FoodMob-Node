"use strict";
/**
 * Util functions to find and update User info
 */

const User = require("./db.js");
const Auth = require("./auth.js");

//Find User with email
module.exports.findUser = function(email) {
    return User.findOne({"email": email});
};

//Get UserProfile of user with email
module.exports.getUserProfile = function(email) {
    return module.exports.findUser(email)
        .then(user => user.profile);
};

//Get Food profile of Authed User
module.exports.getUserFoodProfile = function(email, authToken, foodProfile) {
    return Auth.findAuthedUser(email, authToken, {food_profile: true})
        .then(function(user) {
            return user.food_profile;
        });
};

//Update Food Profile of Authed user
module.exports.updateUserFoodProfile = function(email, authToken, foodProfile) {
    return Auth.updateAuthedUser(email, authToken, {"$set":{"food_profile":foodProfile}});
};