"use strict";

const _ = require('underscore');
var restify = require('restify');
var client = restify.createJsonClient({
  url: 'http://127.0.0.1:8080',
  version: '*'
});

/*
client.post('/echo/test', { hello: 'world', asdf: {test: 'test'} }, function(err, req, res, obj) {
  console.log(req);
  //assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%j', obj);
  console.log(obj.asdf);
  console.log(obj);
})
;
*/
//var email = 'test15@gmail.com';
let email = 'jonathan@foodmob.me';
var password = 'Apple123';
const auth_token = 'm94NboQfSRsESSnDHsiG1brJbOTBHJTba044GxhPLl53fANzKpN2Uw==';
var userLoginInformation = { email: email, password: password};
var userRegistrationInformation = { email: email, password: password, first_name: "Albert", last_name: "Shaw"};
var userAuth = {email: email, auth_token: auth_token};
var foodProfile = {likes: [
      "korean"
    ],
    dislikes: [
      "mexican",
      "southern"
    ],
    allergies: [
      "seafood"
    ]
};

function testGetFoodProfile() {
  client.get('/users/' + encodeURIComponent(email) + '/food_profile?auth_token=' + encodeURIComponent(auth_token),   function(err, req, res, obj) {
    console.log(req);
    console.log(obj.asdf);
    console.log(obj);
    client.close();
  });
}

function testRegister() {
  client.post('/users', userRegistrationInformation, function(err, req, res, obj) {
    console.log(req);
    //assert.ifError(err);
    console.log('%d -> %j', res.statusCode, res.headers);
    console.log('%j', obj);
    console.log(obj.asdf);
    console.log(obj);
    client.close();
  });
}
function testLogin() {
  client.post('/login', userLoginInformation, function(err, req, res, obj) {
      console.log(req);
      //assert.ifError(err);
      console.log('%d -> %j', res.statusCode, res.headers);
      console.log('%j', obj);
      console.log("\n\n");
      console.log(obj);
      client.close();
  });
}

function testFoodProfileUpdate() {

  client.put('/users/'+encodeURIComponent(email)+'/food_profile', {auth_token: auth_token, food_profile: foodProfile}, function(err, req, res, obj) {
    console.log(req);

    console.log('%d -> %j', res.statusCode, res.headers);
    console.log('%j', obj);
    console.log("\n\n");
    console.log(obj);
    client.close();
  });
}

function testLogout() {
  client.post('/logout', userAuth, function(err, req, res, obj) {
    console.log(req);

    console.log('%d -> %j', res.statusCode, res.headers);
    console.log('%j', obj);
    console.log("\n\n");
    console.log(obj);
    client.close();
  });
}

function testSearch() {
  var userLoginInformation = { email: email, password: password};
  let location = "Atlanta"
  let goodCategories = ['korean', 'bbq']
  let badCategories = ['seafood']
  let json = _.extend({ll: [33.7550, -84.3900], good_categories: goodCategories, bad_categories: badCategories}, userAuth)
  client.post('/search', json, function(err, req, res, obj) {
    if (obj.success == true) {
        obj.businesses.forEach(b => console.log(b.name + " " + b.score));
    } else {
        console.log(obj);
        console.log("aww");
    }

    //console.log('%d -> %j', res.statusCode, res.headers);
    //console.log('%j', obj);
    //console.log("\n\n");
    //console.log(obj);
    client.close();
  });
}
//testFoodProfileUpdate();
//testLogin();
//testLogout();
//testGetFoodProfile();
//testRegister();
testSearch();