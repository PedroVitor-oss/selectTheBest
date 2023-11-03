const express = require("express");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { port } = require('../config.json')
const path = require("path")
app.use(express.static(path.join(__dirname,'public')));


//configuração do socket.io

// configurar handlebars
const handlebars = require('express-handlebars');
app.engine('handlebars', handlebars.engine('main'));
app.set('view engine', 'handlebars');
app.set('views', './views');


//configuração Body-Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

module.exports = {
    app,
    io,
    server
}

