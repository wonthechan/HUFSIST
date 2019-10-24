const express = require('express');
const app = express();
var http = require('http').Server(app);

let parseSugang = require('./parseSugang.js');
let updateToken = require('./updateToken');
let checkSugang = require('./checkSugang.js');
let initCheck = require('./initCheck');

const hostname = '0.0.0.0';
const port = 3000;

app.get('/', (req, res) => {
        res.send('hello world');
        console.log('home');
});

app.get('/updateSugang', (req, res) => {
        res.send(req.query.id);
        parseSugang(req.query.id, req.query.pw);
});

app.get('/updateToken', (req, res) => {
        res.send(req.query.id);
        updateToken(req.query.id, req.query.token);
});

app.get('/checkSugang', (req, res) => {
        res.send(req.query.id);
        checkSugang(req.query.id);
});

app.get('/initCheck', (req, res) => {
        res.send(req.query.id);
        initCheck(req.query.id);
        // output message
});

http.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});