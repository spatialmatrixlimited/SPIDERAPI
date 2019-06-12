const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const path = require('path');
const config = require('./config/database');
const routes = require('./routes/routes');
const headers = require('./middleware/headers');
const session = require('./middleware/sessionmanager');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const analytical = require('./middleware/analytical');
const port = process.env.PORT || 6111;
const ip = '192.168.10.4';

mongoose.Promise = global.Promise;
mongoose.connect(config.mlab, {
    useMongoClient: true,
    config: {
        autoIndex: false
    },
    promiseLibrary: global.Promise
}).catch((e) => console.log(e));

const app = express();

//set directory of log files
const logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
})

// setup the logger
app.use(morgan('combined', {
    stream: accessLogStream
}));

//cross origin resourse sharing
app.use(cors());

//body parser
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json({
    limit: '500mb'
}));


//middleware for analytics
app.use(analytical);

// middleware to use for all requests headers
app.use(headers);

//middleware to use for all request session
//app.use(session);

//use api routes
app.use(routes);

//start server and listen on specified port
app.listen(port, function () {
    console.log('SPiDER Server is running on port ' + port);
});


mongoose.connection.on('open', function () {
    console.log('SPiDER Database is connected');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});