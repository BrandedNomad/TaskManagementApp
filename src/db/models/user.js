//importing modules
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

//Creating the user schema
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Please provide a valid email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        min:6,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Your password cannot contain the word 'password'!")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }

},{
    timestamps:true
});

//Tells mongoose that there is a relationship between User and Task
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
});

//Methods

//Returns public data
userSchema.methods.toJSON = function(){
    const user = this;
    const publicUserInfo = user.toObject();

    delete publicUserInfo.password;
    delete publicUserInfo.tokens;
    delete publicUserInfo.avatar;

    return publicUserInfo
};

//Generates authentication token
userSchema.methods.generateAuthToken = async function(){ //uses function instead of ()=>{} to bind this
    const user = this; //Need to bind this on .methods
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET_KEY);
    user.tokens = user.tokens.concat({token:token});
    await user.save();
    return token
};

//Finds user by credentials
userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email}); //no need to bind this

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user
};

//middleware

//Hash plain text password
userSchema.pre('save', async function(next){
    const user = this; //Need to bind this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next();
});

//Deletes all user owned tasks when user account is deleted
userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner:user._id});

    next()
});

const User = mongoose.model('User',userSchema);

module.exports = User;
