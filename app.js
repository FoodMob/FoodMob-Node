const Crypto = require('crypto');

var mongoose = require('mongoose');

// Connection URL. This is where your mongodb server is running.
//var url = 'mongodb://localhost:27017/my_database_name';
var url = 'mongodb://foodmob:foodmob@ds059215.mongolab.com:59215/food_mob';


var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
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
	}
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('users', userSchema);

// make this available to our users in our Node applications
module.exports = User;

mongoose.connect(url, function(err) {
    if (err) throw err;
	console.log("successfully connected")


	main();
});

function main() {


	function generateSalt(callback) {
	    Crypto.randomBytes(256, function(err, buf) {
	        if (err) throw err;
	        callback(buf);
	    });
	}

	function generateAuthToken(callback) {
		Crypto.randomBytes(40, function(err, buf) {
	        if (err) throw err;

	        callback(buf.toString('base64'));
	    });
	}

	function loginUser(email, password, callback) {
		User.findOne({ 'email': email}, function (err, user) {
			if (err || !user) {
				console.log("login Failed")
				callback(true);
			} else {
				console.log("User Found");
				Crypto.pbkdf2(password, user.login.salt, 100000, 512, 'sha512', function (err, hash) {
					if (err) {
						console.log("login Failed")
						callback(true);
					} else if (!user.login.hashed_password.equals(hash)) {
						console.log("Password didn't match")
						//console.log(user.login.hashed_password.toString("utf8"));
						//console.log(hash.toString("utf8"));
						callback(true);
					} else {
						generateAuthToken((string) => {
							user.login.auth_tokens.push({token: string, expire_time: new Date().setFullYear(new Date().getFullYear() + 2)})
							user.save((err) => {
								if (err) {
									console.log(err);
									callback(true);
								} else {
					  				console.log("login successfully");
					  				callback(false, string);
								}
							});
						});
					}
				});
			}
  		});
	}



	//register User
	function registerUser(email, password, first_name, last_name, callback) {
		console.log("Registering user: %s, password: %s, first_name: %s, last_name: %s", 
			email, password, first_name, last_name);

		generateSalt(function (salt) {

		  	console.log("salt " + salt);

			Crypto.pbkdf2(password, salt, 100000, 512, 'sha512', function (err, hash) {
			  	if (err) throw err;

			  	var newUser = User({email: email, 
			  		login: {hashed_password: hash, salt: salt}, 
			  		profile: {first_name: first_name, last_name: last_name}
			  	});

				newUser.save(function(err) {
					if (err) { //throw err;
						console.log(err);
						callback(false);
					} else {
					  	console.log('User created!');
					  	callback(true);
					}
				});
			});
		});
		
		
	}

	var restify = require('restify');
	 
	var server = restify.createServer({
	  name: 'myapp',
	  version: '1.0.0'
	});
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser());
	server.use(restify.bodyParser());

	server.on('uncaughtException', function (req, res, route, err) {
	  console.log('uncaught error', err);
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

	server.post('/user', function (req, res, next) {
		params = req.params;
		email = params.email;
		first_name = params.first_name;
		last_name = params.last_name;
		password = params.password;

		registerUser(email, password, first_name, last_name, function(worked) {
			if (worked) {
				console.log(email + " register successfully");
				res.send({"email": email, success: true});
			} else {
				console.log(email + " registration failed");
				res.send({"email": email, success: false});
			}
			next();
		});
	});

	server.post('/login', function (req, res, next) {
		params = req.params;
		email = params.email;
		password = params.password;

		loginUser(email, password, function(err, token) {
			if (err) {
				console.log(email + " Login Failed");
				res.send({"email": email, success: false});
			} else {
				console.log(email + " login successful");
				res.send({"email": email, success: false, token: token});
			}
			next();
		});
	});


	server.listen(8080, function () {
	  console.log('%s listening at %s', server.name, server.url);
	});
};