"use strict";
/**
 * Main Server File. Sets up API endpoints
 **/

//Imports
const _ = require('underscore');
const UserUtils = require("./user_utils.js");
const Friends = require("./friends.js");
const Auth = require("./auth.js");
const User = require("./db.js");
const Yelp = require("./yelp.js");
const Restfiy = require('restify');

//Create the Restify Server
const server = Restfiy.createServer({
        name: 'FoodMob-Node',
        version: '1.0.0'
    });
server.use(Restfiy.acceptParser(server.acceptable));
server.use(Restfiy.queryParser());
server.use(Restfiy.bodyParser());

//Output Exceptions thrown in Restify
server.on('uncaughtException', function (req, res, route, err) {
    console.error('uncaught error', err);
    console.error(err.stack);
    return res.send(500, 'Unknown Error\n' + err.stack);
});


/**
 * Setup API EndPoints
 *
 * Full API Definition at https://docs.google.com/document/d/1c_W9Swb8wVKoVLiBv0ZFhFMh5jhU5u0iR2UylNOX-5M/edit?usp=sharing
 **/

//Login
server.post('/login', function (req, res, next) {
    console.log(req.params);
    const params = req.params;
    const email = params.email;
    const password = params.password;

    Auth.loginUser(email, password)
        .spread(function (token, user) {
            console.log(email + " login successful");
            res.send({"email": email, success: true, auth_token: token, profile: user.profile});
            next();
        }).catch(function (err) {
        console.log(err);
        console.log(email + " Login Failed");
        res.send({"email": email, success: false});
        next();
    });
});

//Register
server.post('/users', function (req, res, next) {
    const params = req.params;
    const email = params.email;
    const first_name = params.first_name;
    const last_name = params.last_name;
    const password = params.password;

    Auth.registerUser(email, password, first_name, last_name)
        .then(function (newUser) {
            console.log('User created!');
            console.log(email + " register successfully");
            return Auth.loginUser(email, password);
        }).spread(function (authToken, user) {
        console.log("Registration successful");
        res.send({"email": email, "token": authToken, success: true});
        return next();
    }).catch(function (err) {
        console.log("Registration Failed");
        console.log(err);
        console.log(err.stack);
        res.send({"email": email, success: false});
        return next();
    });
});

//Logout
server.post('/logout', function (req, res, next) {
    const params = req.params;
    console.log(req.params);
    const email = params.email;
    const authToken = params.auth_token;
    console.log("logout Request");
    Auth.logoutUser(email, authToken)
        .then(function (user) {
            console.log("Logout Successful");
            res.send({"email": email, success: true});
            return next();
        }).catch(function (err) {
        console.log("Failed!");
        console.log(err);
        res.send({"email": email, success: false});
        return next();
    });
});

//Get Friends
server.get('/users/:userEmail/friends', function (req, res, next) {
    //console.log(req.params);
    const params = req.params;
    const userEmail = params.userEmail;
    const authToken = params.auth_token;

    Friends.getFriends(userEmail, authToken)
        .then(function (friends) {
            //let friends = user.friends;
            console.log("friends " + friends);
            res.send({"friends": friends, success: true});
            next();
        }).catch(function (error) {
        console.log("Failed!", error);
        res.send({success: false});
        next();
    });
});

//Add Friends
server.put('/users/:userEmail/friends', function (req, res, next) {
    //console.log(req.params);
    const params = req.params;
    const userEmail = params.userEmail;
    const friendEmail = params.friend_email;
    const authToken = params.auth_token;

    Friends.addFriend(userEmail, authToken, friendEmail)
        .then(function (user) {
            console.log("Friend Added Successfully " + user);
            res.send({"email": friendEmail, success: true});
            next();
        }).catch(function (error) {
        if (error == "Friend already added") {
            console.log("Duplicated Friend tried to be added " + friendEmail);
            res.send({"email": friendEmail, success: false, error: "duplicate"});
            next();
        } else {
            console.log("Failed!", error);
            res.send({"email": friendEmail, success: false});
            next();
        }
    });
});

//Get Food Profile
server.get('/users/:email/food_profile', function (req, res, next) {
    console.log(req.params);
    const params = req.params;
    const email = params.email;
    const authToken = params.auth_token;

    UserUtils.getUserFoodProfile(email, authToken)
        .then(function (foodProfile) {
            console.log("Food Profile Found " + foodProfile);
            res.send({"email": email, success: true, food_profile: foodProfile});
            next();
        }).catch(function (error) {
        console.log("Failed!", error);
        console.log(error.stack);
        res.send({"email": email, success: false});
        next();
    });
});

//Update Food Profile
server.put('/users/:email/food_profile', function (req, res, next) {
    console.log(req.params);
    const params = req.params;
    const email = params.email;
    const authToken = params.auth_token;
    const foodProfile = params.food_profile;

    UserUtils.updateUserFoodProfile(email, authToken, foodProfile)
        .then(function (user) {
            console.log("User Update successful " + foodProfile);
            res.send({"email": email, success: true});
            next();
        }).catch(function (error) {
        console.log("Failed!", error);
        res.send({"email": email, success: false});
        next();
    });
});

//Search for Restaurants
server.post('/search', function (req, res, next) {
    console.log("Search");
    console.log(req.params);
    const params = req.params;
    const email = params.email;
    const authToken = params.auth_token;
    const users = params.friends;
    const location = params.location;
    const minRating = params.min_rating;

    let options;
    if (params.options) {
        options = params.options;
    } else {
        options = {};
    }

    let ll = params.ll;
    if (ll) {
        ll = ll.join()
    }


    let cll = params.c11;
    if (cll) {
        cll = cll.join();
    }

    const goodCategories = [];
    goodCategories.push(params.good_categories);
    const badCategories = [];
    badCategories.push(params.bad_categories);
    const allergyCategories = [];
    allergyCategories.push(params.allergy_categories);


    UserUtils.getUserFoodProfile(email, authToken)
        .then(function (foodProfile) {
            goodCategories.push(foodProfile.likes);
            badCategories.push(foodProfile.dislikes);
            allergyCategories.push(foodProfile.allergies);

            let ourOptions = {};


            ourOptions.limit = 20;

            if (minRating) {
                ourOptions.sort = 2;//Best Rating
            }


            _.extend(ourOptions, options);

            return Yelp.searchYelp("restaurants", location, cll, ll, ourOptions)
        }).then(function (data) {
        let businesses = data.businesses;
        let location = data.region;

        businesses = businesses.filter(function (business) {
            console.log(minRating, business.rating);
            if (minRating) {
                if (!business.rating || minRating > business.rating) {
                    return false;
                }
            }
            return true;
        });

        businesses.forEach(function (business) {
            let categories = business.categories.map(p => p[1])
            let score = 0
            const goodCatCount = goodCategories.map(array => _.intersection(array, categories).length);
            const badCatCount = badCategories.map(array => _.intersection(array, categories).length);
            const allergyCatCount = allergyCategories.map(array => _.intersection(array, categories).length);


            let goodCount = goodCatCount.reduce(function (a, b) {
                return a + b
            });
            let badCount = badCatCount.reduce(function (a, b) {
                return a + b
            });
            let allergyCount = allergyCatCount.reduce(function (a, b) {
                return a + b
            });

            score += goodCount * 5;
            score -= badCount * 5;
            score -= allergyCount * 25;


            business.score = score
            console.log(business.name)
            console.log(categories)
            console.log("score")
            console.log(business.score)
            //console.log("name: " +businesses.name)
        });

        businesses.sort(function (a, b) {
            return b.score - a.score
        });
        res.send({"businesses": businesses, success: true});
        next();
    }).catch(function (err) {
        console.log("Failed!", err);
        res.send({"email": email, success: false});
        next();
    });
});

module.exports = server;