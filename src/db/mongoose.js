const mongoose = require('mongoose');


const connectionURL = process.env.MONGOOSE_CONNECTION_STRING;


mongoose.connect(connectionURL,{useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex:true,useFindAndModify:false });



