const request = require('supertest');
const server = require("../src/app");
const {
    userOneId,
    userOne,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
} = require('./fixtures/db');
const Task = require('../src/db/models/task');

beforeEach(setupDatabase);

test('Should create task for user', async ()=>{
    const response = await request(server)
        .post('/tasks')
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .send({
            description:"Go for a run"
        })
        .expect(201);

    //Assert that task was updated correctly
    const task = await Task.findById(response.body._id);
    expect(task.description).not.toBeNull();
    expect(task.completed).toBe(false)
});

test('Should only return tasks for userTwo', async()=>{
    const response = await request(server)
        .get('/tasks')
        .set("Authorization",`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200);

    const notMyTask = response.body.filter((task)=>{
        return task.owner != userTwoId;
    });
    expect(notMyTask).toEqual([]);
});

test('Should only return tasks for userOne', async()=>{
    const response = await request(server)
        .get('/tasks')
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const notMyTask = response.body.filter((task)=>{
        return task.owner != userOneId;
    });
    expect(notMyTask).toEqual([]);
});

test('Should not delete other users tasks', async ()=>{
    const response = await request(server)
        .delete('/tasks/' + taskThree._id)
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskThree._id);
    expect(task).not.toBeNull()

});

test('Should delete a single user task', async ()=>{
    const response = await request(server)
        .delete('/tasks/' + taskTwo._id)
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskTwo._id);
    expect(task).toBeNull()

});

test('Should Fail to delete a single user task while not authenticated', async ()=>{
    const response = await request(server)
        .delete('/tasks/' + taskTwo._id)
        .send()
        .expect(401)
    const task = await Task.findById(taskTwo._id);
    expect(task).not.toBeNull()
});