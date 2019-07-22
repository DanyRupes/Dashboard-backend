const express = require('express');
const path = require('path');
const morgan = require('morgan');
var bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')

// For password encryption
const bcrypt = require('bcrypt');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var secret = require('./config/key').secretOrKey

// Image upload destination
var multer = require('multer');
var ejs = require('ejs')
var upload = multer({ dest: 'public/images/' })

//dB connection key
var mongoose = require('mongoose')
var mongodb = require('mongodb')
const uri = require('./config/key').mongoURI
console.log(uri)

// Send OTP
var SendOtp = require('sendotp');
// Send sms
let authKey = require('./config/key').authKey
var msg91 = require('msg91-sms');

// create our Express app
const app = express();
// To connect mongodb
const server = http.createServer(app)

app.set('view engine', 'ejs')
app.use(express.static('/images'))
// app.use(bodyParser);
// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

//logger
app.use(morgan());
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors())

//routes
const v1 = require('./routes/v1');
app.use('/v1', v1);

//Db connection
const MongoClient = require('mongodb').MongoClient;

// replace the uri string with your connection string.
mongoose.connect(uri, { useNewUrlParser: true }, (err, database) =>{
    if(err)
        return console.error(err);

    const port = 3000;
    server.listen(port, ()=> console.log("hai port"));
    // app.listen(port, ()=> console.log('Listening on port'  ${port}));
});


app.get('/hello', (req,res)=>{
	res.send({msg:'Hello World  Checking'})
});

app.post('/sendMsg',async(req,res) =>{
  let number = 6388941567
  let message = "Hello there,"
  msg91.sendOne(authKey,number,message,611332,function(response){
    //Returns Message ID, If Sent Successfully or the appropriate Error Message
    console.log(response);
    response.send(response)
  });
});


module.exports = app;
