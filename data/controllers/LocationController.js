var jwt = require('jsonwebtoken');
var secret = require('../../config/key').secretOrKey

const Admin = require('./../models/admin');
const Location = require('./../models/location');

const addLocation = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to do this job."})}
    else{
      let checkLocation = await Location.findOne({place:req.body.place})
      if (!checkLocation) {
        let newLocation = await Location.create({place:req.body.place,city:req.body.city,pincode:req.body.pincode})
        res.send({details:newLocation})
      }
      else{
        res.send({message:"Already Available"})
      }
    }
  }
  else{
      res.send({message:"Please logIn to continue."})
  }
}

const viewLocation = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    let fetchLocation = await Location.find({is_active:1})
    res.send({details:fetchLocation})
  }
  else{
      res.send({message:"Please logIn to continue."})
  }
}

// get location for web view to make easy
const getLocation = async function(req,res){
  if (req.query.city) {
    let checkLocation = await Location.find({city:req.query.city,is_active:1})
    res.send({details:checkLocation});
  }
  else{
    res.send({message:"Please provide city name"})
  }
}

module.exports = {
  addLocation,
  viewLocation,
  getLocation
}
