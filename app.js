"use strict";
/**
 * Main Server File. Connects to Database and gets server and starts server
 **/

//Create the server
const server = require("./server.js");

//Starts the server
server.listen(8081, function () {
  console.log('%s listening at %s', server.name, server.url);
});


