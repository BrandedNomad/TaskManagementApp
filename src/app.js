
//import modules
const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');


//import models
require('./db/mongoose');


//create server
const server = express();

//Configure server

////JSON Parser
server.use(express.json());


////Routers
server.use(userRouter);
server.use(taskRouter);

module.exports = server;



