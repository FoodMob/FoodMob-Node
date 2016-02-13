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
const auth_token = 'uSCXYbrzOwuWEKVLFEZFw9oKV0cNESyFFdB0AWoQSeyF1GNFce1GRQ==';
var userLoginInformation = { email: email, password: password};
var userRegistrationInformation = { email: email, password: password, first_name: "Albert", last_name: "Shaw"};
var userAuth = {email: email, auth_token: auth_token};
var foodProfile = {likes: [
      "Korean",
      "Mexican"
    ],
    dislikes: [
      "Southern",
      "Tex-Mex"
    ],
    allergies: [
      "Seafood"
    ]
};


function testRegister() {
  client.post('/user', userRegistrationInformation, function(err, req, res, obj) {
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

  client.post('/user/food_profile', _.extend({food_profile: foodProfile}, userAuth), function(err, req, res, obj) {
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
testRegister();