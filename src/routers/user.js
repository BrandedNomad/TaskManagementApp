//Importing modules
const express = require('express');
const Task = require('../db/models/task');
const User = require('../db/models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account');

//creating router
const router = express.Router();

//user endpoints

//Create a new User
router.post("/users",async (req,res)=> {

    try {
        const user = new User(req.body);
        sendWelcomeEmail(user.email,user.name);
        const token = await user.generateAuthToken();
        //await user.save();
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }

});

//Login
router.post('/Users/login',async (req,res)=>{

    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.send({user,token})
    }catch(error){
        res.status(404).send()
    }
});

//Logout
router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        });
        await req.user.save();
        res.send()
    }catch(error){
        res.status(500).send();
    }

});

//logout of all sessions
router.post('/users/logoutall',auth, async(req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send()
    }catch(error){
        res.status(500).send()
    }
});

//Return a user's profile
router.get('/users/me',auth,async (req,res)=>{

    try{
        res.status(200).send(req.user)
    }catch(error){
        res.status(500).send(error)

    }

});

//Find and returns a single user
router.get('/users/:id',async (req,res)=>{

    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user)

    }catch(error){
        res.status(400).send(error)
    }

});

///Updates a specific user Endpoint
router.patch('/users/me', auth, async (req,res)=>{

    //Check if provided values are valid
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name","email","password"];
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    });

    if(!isValidOperation){
        return res.status(400).send({error:"Invalid operation"})
    }

    //update
    try{
        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        //The above is the old line, but it needs to be done explicitly because .findById bypasses the middleware
        //The code below is a more explicit way of updating the user so the middleware is not bypassed
        const user = await User.findById(req.user._id); //finds user
        if(!user){ //checks if user exists
            return res.status(404).send()
        }
        updates.forEach((update)=>{ //updates the user manually
            user[update] = req.body[update]
        });
        await user.save(); //saves the new values and triggers the middleware


        res.status(200).send(user)
    }catch(error){
        res.status(500).send(error)
    }
});

//upload user profile picture
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload either jpg, jpeg, or png"))
        }

        cb(undefined,true)
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    try{
        const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send()
    }catch(error){
        res.status(500).send(error)
    }

},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
});

//Get User Avatar
router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            return res.status(404).send()
        }
        res.set('content-type','image/png');
        res.status(200).send(user.avatar)
    }catch(error){
        res.status(500).send(error)
    }
});

//Delete User Avatar
router.delete('/users/me/avatar', auth, async (req,res)=>{
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send("Profile pic deleted successfully")
    }catch(error){
        res.status(500).send(error)
    }

});



//Deletes a user Endpoint
router.delete('/users/me', auth, async (req,res)=>{

    try{
        await req.user.remove();
        sendCancelationEmail(req.user.email,req.user.name);
        res.status(200).send(req.user)
    }catch(error){
        res.status(500).send(error)
    }
});

module.exports = router;