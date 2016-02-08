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

user_register_info = { email: 'test2@gmail.com', password: "school", first_name: "Albert", last_name: "Shaw"};

client.post('/user', user_register_info, function(err, req, res, obj) {
  console.log(req);
  //assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%j', obj);
  console.log(obj.asdf);
  console.log(obj);
  client.close();
});