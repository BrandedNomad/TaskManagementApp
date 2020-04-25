const request = require('supertest');
const server = require("../src/app");
const User = require("../src/db/models/user");
const {userOneId,userOne,setupDatabase} = require('./fixtures/db');


const userTwo = {
    name:"Jono",
    email:"jono@mail.com",
    password:"1234abcd"
};

beforeEach(setupDatabase);

test('Should create a new user', async()=>{

    const response = await request(server)
        .post('/users')
        .send({
        name:'Andre',
        email:'andre@mail.com',
        password:"1234abcd"
    })
        .expect(201);

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    //Assertion about the response
    expect(response.body).toMatchObject({
        user:{
            name:'Andre',
            email:'andre@mail.com'
        },
        token:user.tokens[0].token
    });
    expect(user.password).not.toBe("1234abcd")

});

test('Should login existing user', async ()=>{
    const response = await request(server)
        .post('/users/login')
        .send({
        email:userOne.email,
        password:userOne.password
    })
        .expect(200);


    //Asserts that token was created
    const user = await User.findById(response.body.user._id);
    expect(user.tokens[1].token).toBe(response.body.token)
});

test('Should fail to login non existing user', async ()=>{
    await request(server)
        .post('/users/login')
        .send({
        email:userTwo.email,
        password:userTwo.password
    })
        .expect(404)
});

test("Should get user profile", async ()=>{
    await request(server)
        .get('/users/me')
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
});

test('Should fail to retreive user profile for unauthenticated user', async ()=>{
    await request(server)
        .get('/users/me')
        .send()
        .expect(401)
});

test('Should delete account for user', async ()=>{
    const response = await request(server)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);


    //Asserts user was deleted
    const user = await User.findById(userOne._id);
    expect(user).toBeNull()
});

test('Should fail to delete account for unauthenticated user', async ()=>{
    await request(server)
        .delete('/users/me')
        .send()
        .expect(401)
});

test('Should upload avatar image', async()=>{
    await request(server)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`) //sets header
        .attach('avatar','tests/fixtures/profile-pic.jpg') //attaches image
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer)) //expect.any(Buffer) checks if something is of a certain type like a Buffer


});

test('Should update valid user fields', async ()=>{
    await request(server)
        .patch('/users/me')
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .send({
            name:"Chris"
        })
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toBe('Chris')
});

test("Should fail to update user field due to invalid data", async ()=>{
    await request(server)
        .patch('/users/me')
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .send({
            surname:"Donkey Kong"
        })
        .expect(400)
});


