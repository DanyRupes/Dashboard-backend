//  For password encryption
const bcrypt = require('bcrypt');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var secret = require('../../config/key').secretOrKey

const Admin = require('./../models/admin');

// Admin Signup
const adminSignup = async function(req,res){
  console.log('in adminSignup')
  console.log(req.body)
  let hashedPassword = bcrypt.hashSync(req.body.password,8)
  let admin = await Admin.create({name: req.body.name, email: req.body.email, password: hashedPassword,phoneno: req.body.phoneno})
  if(admin){
    let token = jwt.sign({id:admin.id}, secret)
    res.status(200).send({auth: true, token: token,message:"Successfully Signed Up."});
  }else{
    res.status(500).send({auth: false, message: "There was a problem registering the user"});
  }
}

// Admin Login
const adminLogin = async function(req,res){
  if (req.body.email && req.body.password)
  {
    const checkadmin = await Admin.findOne({email:req.body.email})
  	if (!checkadmin) { res.status(404).send({auth: false, message: "No user found"})}
  	var passwordIsValid = await bcrypt.compareSync(req.body.password, checkadmin.password)
  	if (!passwordIsValid) { res.status(401).send({auth: false, message:"Check your password",token: null})}
  	var token = await jwt.sign({id: checkadmin.id}, secret)
  	res.status(200).send({auth: true, message:"Login success", token: token, name: checkadmin.name})
  }
  else{
  	res.status(400).send({message:"Please provide the required parameters to login."})
  }
}

// To check auth status in view - dany
const adminAuthStatus = async (req, res)=>{
  if(!req.headers.token){
    res.send({'message':"NO_TOKEN"})
    return
  }
   let verifyAdmin
      try {
        verifyAdmin = await jwt.verify(req.headers.token,secret)
      }
      catch(error){
        {res.send({'message':'WRONG_TOKEN'});return}
      }
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1},{password:0})
    if(!checkAdmin) { res.send({'message':'NO_USER'});return}
    res.send({details:checkAdmin, message:"FINE"})
}


module.exports = {
  adminSignup,
  adminLogin,
  adminAuthStatus
}
