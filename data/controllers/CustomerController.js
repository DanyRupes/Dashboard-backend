//  For password encryption
const bcrypt = require('bcrypt');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var secret = require('../../config/key').secretOrKey
// Send OTP
var SendOtp = require('sendotp');
let authKey = require('../../config/key').authKey

const Admin = require('./../models/admin');
const Customer = require('./../models/customer');
const Cart = require('./../models/cart');
const SalesCustomer = require('./../models/sales_customer');
// const Product = require('./../models/product');
// const Location = require('./../models/location');
// const ProductLocation = require('./../models/product_location');

// Add Customers and create a cart for customer from admin.
const addCustomer = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.salesId) {
      let checkCustomer = await Customer.findOne({email:req.query.email,phoneno:req.query.phoneno,is_active:1})
      if (!checkCustomer) {
        let newCustomer = await Customer.create({name:req.query.name,email:req.query.email,phoneno:req.query.phoneno,address:req.query.address,place:req.query.place,city:req.query.city,pincode:req.query.pincode})
        let checkSalesCustomer = await SalesCustomer.findOne({sales_id:req.query.salesId,customer_id:newCustomer.id})
        // Map under a sales
        if (!checkSalesCustomer) {
          let mapSalesCustomer = await SalesCustomer.create({sales_id:req.query.salesId,customer_id:newCustomer.id,is_assigned:1})
        }
        // Create a cart for customer
        if (newCustomer) {
          let checkCart = await Cart.findOne({customer_id:newCustomer.id,is_active:1})
          if (!checkCart) {
            var newCart = await Cart.create({customer_id:newCustomer.id})
          }
          else{res.send({message:"Cart is already avilable for this customer."})}
        }
        res.send({details:newCustomer,cartId:newCart.id})
      }
      else{
        res.send({message:"Customer is already available"})
      }
    }
    else{
      res.send({message:"Provide salesId,because under a sales only you can create a customer."})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// View customer list from admin
const allCustomer = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    let getCustomers = await Customer.find({is_active:1},{password:0})
    res.send({details:getCustomers})
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// Get customer in detail
const oneCustomer = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.customerId) {
      let getCustomer = await Customer.findOne({_id:req.query.customerId,is_active:1},{password:0})
      res.send({details:getCustomer})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// Ask Customer to set passowrd for their account.
const setPassword = async function(req,res){
  if (req.body.email && req.body.password)
  {
    let checkCustomer = await Customer.findOne({email:req.body.email})
    if (!checkCustomer) { res.status(404).send({auth: false, message: "No user found"})}
    let hashedPassword = bcrypt.hashSync(req.body.password,8)
    let updatePwd = await Customer.updateOne({email: req.body.email},{$set:{password: hashedPassword}})
    res.status(200).send({message:"Password updated."})
  }
  else{
    res.status(400).send({message:"Please provide the required parameters."})
  }
}

// Send OTP API
const sendOTPLoginCustomer = async function(req,res){
  if (req.body.phoneno) {
    let checkCustomer = await Customer.findOne({phoneno:req.body.phoneno})
    if (!checkCustomer) {
      res.send({message:"Number does'nt exists"})
    }
    else{
      const sendOtp = new SendOtp(authKey);
      let sendOtptoSales = await sendOtp.send(req.body.phoneno, 611332, async function(err, data){
        if (err) {
          res.send(err)
        }
        else if (data.type == 'success') {
          console.log(data)
          res.send({message:"OTP has send to your number."})
        }
        else{
          res.send({message:data.message})
        }
      });
    }
  }
  else{
      res.send({message:"Please enter your number"})
  }
}

// Login as Customer using email or phoneno
const customerLogin = async function(req,res){
  // Login Via OTP
  if (req.body.phoneno && req.body.otp) {
      let checkCustomer = await Customer.findOne({phoneno: req.body.phoneno})
      if (checkCustomer) {
        const sendOtp = new SendOtp(authKey);
        let verifyOtp = await sendOtp.verify(req.body.phoneno, req.body.otp, async function(err, data){
          if (err) {
            console.log(err)
          }
          else if (data.type === "success") {
            res.send({message:"Login success"})
          }
        });
      }
      else {
          res.send({message:"Number does'nt exists"})
      }
  }
  // Login via email
  else if (req.body.email && req.body.password) {
    const checCustomer = await Customer.findOne({email:req.body.email})
    if (!checCustomer) { res.status(404).send({auth: false, message: "No user found"})}
    var passwordIsValid = await bcrypt.compareSync(req.body.password, checCustomer.password)
    if (!passwordIsValid) { res.status(401).send({auth: false, message:"Check your password",token: null})}
    var token = await jwt.sign({id: checCustomer.id}, secret)
    res.status(200).send({auth: true, message:"Login success", token: token})
  }
  else{
  		res.status(400).send({message:"Please provide the required parameters to login."})
  }
}


module.exports = {
  addCustomer,
  allCustomer,
  oneCustomer,
  setPassword,
  sendOTPLoginCustomer,
  customerLogin
}
