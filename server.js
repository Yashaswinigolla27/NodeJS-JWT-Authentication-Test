
const express = require('express');
const app = express();
const { expressjwt: exjwt } = require("express-jwt");
const jwt = require('jsonwebtoken');
//const exjwt = require('express-jwt');
const bodyParser = require('body-parser');

app.use((req, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    response.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
})

const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3001;
const secretKey = 'my super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'yashaswini',
        password: '123'
    },
    {
        id: 2,
        username: 'golla',
        password: '456'
    }
];

app.post('/api/login', (req, response) => {
    const { username, password } = req.body;
    
    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m'});
            response.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else {
            response.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
});

app.get('/api/prices', jwtMW, (req, response) => {
    response.json({
        success: true,
        myContent: 'This is the price $3.99'
    });
});

app.get('/api/dashboard', jwtMW, (req, response) => {
    response.json({
        success: true,
        myContent: 'Secret content that only logged in people can see'
    });
});

app.get('/api/settings', jwtMW, (req, response) => {
    response.json({
        success: true,
        myContent: 'This is settings - protected route'
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function(err, req, response, next) {
    // console.log(err.name == 'UnauthorizedError');
    // console.log(err);
    if (err.name == 'UnauthorizedError') {
        response.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
})

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});