//import test
const server = require("./app");


//import modules
// const express = require('express');
// const userRouter = require('./routers/user');
// const taskRouter = require('./routers/task');
//

//import models
//require('./db/mongoose');


//create server
//const server = express();

//Configure server

////Port
const port = process.env.PORT;


////JSON Parser
//server.use(express.json());


////Routers
//server.use(userRouter);
//server.use(taskRouter);


//Start server
server.listen(port,(error,response)=>{
    if(error){
        console.log(error)
    }else{
        console.log("Server is up and running on port: " + port)
    }
});



