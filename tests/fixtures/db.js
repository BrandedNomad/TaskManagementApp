const User = require("../../src/db/models/user");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const Task = require('../../src/db/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id:userOneId,
    name:"Charl",
    email:"charl@mail.com",
    password:"1234abcd",
    tokens:[{
        token:jwt.sign({_id:userOneId},process.env.JWT_SECRET_KEY)
    }]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id:userTwoId,
    name:"Jo",
    email:"jo@mail.com",
    password:"1234abcd",
    tokens:[{
        token:jwt.sign({_id:userTwoId},process.env.JWT_SECRET_KEY)
    }]
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description:"Buy milk",
    completed:false,
    owner:userOneId
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description:"Buy bread",
    completed:true,
    owner:userOneId
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description:"Buy tomatoes",
    completed:false,
    owner:userTwoId
};

const setupDatabase = async ()=>{
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
};