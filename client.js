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
var email = 'test15@gmail.com';
var password = 'school';
const auth_token = 'onrLoYLjFEvG/FT9AcekITfCNqGwEdgW19cY/nnbzUdj6BZtamOzgg==';
var userLoginInformation = { email: email, password: password};
var userRegistrationInformation = { email: email, password: password, first_name: "Albert", last_name: "Shaw"};
var userAuth = {email: email, auth_token: auth_token};
var foodProfile = {likes: [
      "Korean"
    ],
    dislikes: [
      "Mexican",
      "Southern",
      "Tex-Mex"
    ],
    allergies: [
      "Seafood"
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
//testFoodProfileUpdate();
//testLogin();
//testLogout();
testGetFoodProfile();
//testRegister();