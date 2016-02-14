"use strict";

const Promise = require("bluebird");
const Crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

Promise.promisifyAll(Crypto);




// Connection URL. This is where your mongodb server is running.
//var url = 'mongodb://localhost:27017/my_database_name';
const url = 'mongodb://foodmob:foodmob@ds059215.mongolab.com:59215/food_mob';


const Schema = mongoose.Schema;

// create a schema
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  login: {
    hashed_password: { type: Buffer, required: true },
    salt: {type: Buffer, required: true},
    auth_tokens: [{
      token: {type: String, required: true},
      expire_time: Date 
    }]
  },
  profile: {
    first_name: { type: String, required: true},
    last_name: { type: String, required: true}
  },
  food_profile: {
    likes: [String],
    dislikes: [String],
    allergies: [String]
  }
});

// the schema is useless so far
// we need to create a model using it
const User = mongoose.model('users', userSchema);

// make this available to our users in our Node applications
module.exports = User;

mongoose.connect(url, function(err) {
    if (err) throw err;
  console.log("successfully connected")


  main();
});

function main() {

  function authUserCriteria(email, authToken) {
    return {"email": email, "login.auth_tokens.token": authToken};
  }

  function generateSalt() {
    return Crypto.randomBytesAsync(256);
  }

  function generateAuthToken() {
    return Crypto.randomBytesAsync(40)
    .then((buf) => {
      return buf.toString('base64');
    });
  }

  function findAuthedUser(email, authToken, projection) {
    let query = User.findOne(authUserCriteria(email, authToken), projection);
    return query.exec().then(function(user) {
      if (user) {
        return user;
      } else {
        return Promise.reject("Authentication Failed");
      }
    });
  }

  function updateAuthedUser(email, authToken, update) {
    let query = User.findOneAndUpdate(authUserCriteria(email, authToken), update, {new: true});
    return query.exec()
    .then(function(user) {
      if (user) {
        return user;
      } else {
        return Promise.reject("Authentication Failed");
      }
    });
  }

  function loginUser(email, password) {
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
  }

  function logoutUser(email, authToken) {
    return updateAuthedUser(email, authToken, {"$pull":{"login.auth_tokens": {"token": authToken}}});
  }

  function updateUserFoodProfile(email, authToken, foodProfile) {
    return updateAuthedUser(email, authToken, {"$set":{"food_profile":foodProfile}});
  }

  function getUserFoodProfile(email, authToken, foodProfile) {
    return findAuthedUser(email, authToken, {food_profile: true})
    .then(function(user) {
      return user.food_profile;
    });
  }


  //register User
  function registerUser(email, password, first_name, last_name) {
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
  }

  const restify = require('restify');
   
  const server = restify.createServer({
    name: 'myapp',
    version: '1.0.0'
  });
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  server.on('uncaughtException', function (req, res, route, err) {
    console.log('uncaught error', err);

    console.log(err.stack);
    return res.send(500, 'foo');
  });
   
  server.get('/echo/:name', function (req, res, next) {
    //console.log(res);
    //console.log(req)
    res.send(req.params);
    return next();
  });

  server.post('/echo/:name', function (req, res, next) {
    console.log(req.params)
      res.send(req.body);
      return next();
  });

  server.post('/users', function (req, res, next) {
    const params = req.params;
    const email = params.email;
    const first_name = params.first_name;
    const last_name = params.last_name;
    const password = params.password;

    registerUser(email, password, first_name, last_name)
    .then( function(newUser) {
      console.log('User created!');
      console.log(email + " register successfully");
      return loginUser(email, password);
    }).spread(function (authToken, user){
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

  server.put('/users/:email/food_profile', function (req, res, next) {
    console.log(req.params);
    const params = req.params;
    const email = params.email;
    const authToken = params.auth_token;
    const foodProfile = params.food_profile;

    updateUserFoodProfile(email, authToken, foodProfile)
    .then(function(user) {
      console.log("User Update successful " + foodProfile);
      res.send({"email": email, success: true});
      next();
    }).catch(function(error) {
      console.log("Failed!", error);
      res.send({"email": email, success: false});
      next();
    });
  });

  server.get('/users/:email/food_profile', function (req, res, next) {
    console.log(req.params);
    const params = req.params;
    const email = params.email;
    const authToken = params.auth_token;

    getUserFoodProfile(email, authToken)
    .then(function(foodProfile) {
      console.log("Food Profile Found " + foodProfile);
      res.send({"email": email, success: true, food_profile: foodProfile});
      next();
    }).catch(function(error) {
      console.log("Failed!", error);
      console.log(error.stack);
      res.send({"email": email, success: false});
      next();
    });
  });

  server.post('/logout', function(req, res, next) {
    const params = req.params;
    console.log(req.params);
    const email = params.email;
    const authToken = params.auth_token;
    console.log("logout Request");
    logoutUser(email, authToken)
    .then(function(user) {
      console.log("Logout Successful");
      res.send({"email": email, success: true});
      return next();
    }).catch(function(err) {
      console.log("Failed!");
      console.log(err);
      res.send({"email": email, success: false});
      return next();     
    });
  });

  server.post('/login', function (req, res, next) {
    console.log(req.params);
    const params = req.params;
    const email = params.email;
    const password = params.password;

    loginUser(email, password)
    .spread(function(token, user) {
      console.log(email + " login successful");
      res.send({"email": email, success: true, auth_token: token, profile: user.profile});
      next();
    }).catch(function(err) {
      console.log(err);
      console.log(email + " Login Failed");
      res.send({"email": email, success: false});
      next();
    });
  });


  server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
  });
};