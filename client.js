"use strict";

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
var email = 'test3@gmail.com';
var password = 'school';
var userLoginInformation = { email: email, password: password};
var userRegistrationInformation = { email: email, password: password, first_name: "Albert", last_name: "Shaw"};
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
testLogin();
//testRegister();