const express = require('express');
const Task = require('../db/models/task');
const User = require('../db/models/user');
const auth = require('../middleware/auth');

const router = express.Router();



////////Creates a new task
router.post("/tasks", auth, async (req,res)=>{

    const task = new Task({
        ...req.body,
        owner:req.user._id
    });

    try{
        await task.save();
        res.status(201).send(task);
    }catch(error){
        res.status(400).send(error)
    }


});

////////Returns a list of task
router.get("/tasks", auth, async (req,res)=>{

    const match ={};
    const sort = {};

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try{
        //const tasks = await Task.find({owner:req.user._id})   ... or below ...
        await req.user.populate({
            path:'tasks',
            match: match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(req.user.tasks)
    }catch(error){
        res.status(500).send(error)
    }

});

////////Finds and returns a specific task
router.get("/tasks/:id", auth, async (req,res)=>{

    const id = req.params.id;

    try{
        const task = await Task.findOne({_id:id, owner:req.user._id});
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task);
    }catch(error){
        res.status(500).send(error)
    }

});

////////Update a Task
router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description","completed"];
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    });

    if(!isValidOperation){
        return res.status(400).send({error:"Invalid operation"});
    }

    try{
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        //The above is the old line, but it needs to be done explicitly because .findById bypasses the middleware
        //The code below is a more explicit way of updating the user so the middleware is not bypassed
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id}); //finds task
        if(!task){ //check if task exists
            res.status(404).send();
        }

        updates.forEach((update)=>{ //manually updates task
            task[update] = req.body[update]
        });

        await task.save(); //saves and triggers middleware

        res.status(200).send(task)

    }catch(error){

        res.status(500).send(error)

    }

});

////////Deletes a Task
router.delete('/tasks/:id', auth, async (req,res)=>{

    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id});
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)

    }catch(error){
        res.status(500).send(error)
    }

});

module.exports = router;