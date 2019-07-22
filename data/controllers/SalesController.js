var jwt = require('jsonwebtoken');
var secret = require('../../config/key').secretOrKey
// Send OTP
var SendOtp = require('sendotp');
let authKey = require('../../config/key').authKey

const Admin = require('./../models/admin');
const Sale = require('./../models/sales');
const Customer = require('./../models/customer');
const SalesCustomer = require('./../models/sales_customer');

// Add new sales person from admin
const addSalesPerson = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    let checkSales = await Sale.findOne({phoneno:req.query.phoneno,is_active:1})
    if (!checkSales) {
      let newSalesPerson = await Sale.create({name:req.query.name,phoneno:req.query.phoneno,address:req.query.address,place:req.query.place,city:req.query.city})
      res.send({details:newSalesPerson})
    }
    else{
      res.send({message:"Sales is available"})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// View all sales preson list from admin
const allSales = async function(req,res){
  let getLocation;
  let getSales;
  let checkSalesCustomer;
  let customerId;
  let getCustomer;
  let fetchLocation;
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.locationId) {
      // For filter by location.
      getLocation = await Location.findOne({_id:req.query.locationId,is_active:1})
      if (req.query.searchKey) {
        getSales = await Sale.find({name: new RegExp(searchKey),place:getLocation.place,city:getLocation.city,is_active:1})
      }
      else{
        getSales = await Sale.find({place:getLocation.place,city:getLocation.city,is_active:1})
      }
      let salesLoop = await getSales.map(async(li) => {
        checkSalesCustomer = await SalesCustomer.find({sales_id:li.id})
        customerId = checkSalesCustomer.map(x => x.customer_id)
        getCustomer = await Customer.find({_id:customerId,is_active:1},{password:0})
        let locLoop = await getCustomer.map(async(loc) => {
          fetchLocation = await Location.findOne({place:loc.place,city:loc.city,is_active:1})
          loc._doc['locationId'] = fetchLocation.id
        })
        await Promise.all(locLoop);
        li._doc['customers'] = getCustomer
      })
      await Promise.all(salesLoop)
      console.log(getSales)
      res.send({details:getSales})
    }
    else{
      if (req.query.searchKey) {
        getSales = await Sale.find({name: new RegExp(searchKey),is_active:1})
      }
      else{
        getSales = await Sale.find({is_active:1})
        // getSales = await Sale.find({place:getLocation.place,city:getLocation.city,is_active:1})
      }
      let salesLoop = await getSales.map(async(li) => {
        checkSalesCustomer = await SalesCustomer.find({sales_id:li.id})
        customerId = checkSalesCustomer.map(x => x.customer_id)
        getCustomer = await Customer.find({_id:customerId,is_active:1},{password:0})
        li._doc['customers'] = getCustomer
      })
      await Promise.all(salesLoop)
      console.log(getSales)
      res.send({details:getSales})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// To get customer location Id while creating an order
const getCustomerLocation = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.customerId) {
      let checkCustomer = await Customer.findOne({_id:req.query.customerId,is_active:1},{password:0,phoneno:0})
      if (!checkCustomer) {res.send({message:"Customer not available"})}
      let getLocation = await Location.findOne({place:checkCustomer.place,is_active:1})
      checkCustomer._doc['locationId'] = getLocation.id
      res.send({details:checkCustomer})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// View sales indetail from admin
const oneSalesDetail = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.salesId) {
      let getSales = await Sale.findOne({_id:req.query.salesId,is_active:1})
      res.send({details:getSales})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// Send OTP API
const sendOTPLoginSales = async function(req,res){
  if (req.query.phoneno) {
    let checkSales = await Sale.findOne({phoneno:req.query.phoneno})
    if (!checkSales) {
      res.send({message:"Number does'nt exists"})
    }
    else{
      const sendOtp = new SendOtp(authKey);
      let sendOtptoSales = await sendOtp.send(req.query.phoneno, 611332, async function(err, data){
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

// SalesPerson Login
const salesLogin = async function(req,res){
  // Login Via OTP
  if (req.query.phoneno && req.query.otp) {
      let checkSales = await Sale.findOne({phoneno: req.query.phoneno})
      if (checkSales) {
        const sendOtp = new SendOtp(authKey);
        let verifyOtp = await sendOtp.verify(req.query.phoneno, req.query.otp, async function(err, data){
          if (err) {
            console.log(err)
          }
          else if (data.type === "success") {
            let updateSales = await Sale.updateOne({phoneno:req.query.phoneno},{$set:{is_loggedin:1}})
            res.send({message:"Login success"})
          }
        });
      }
      else {
          res.send({message:"Number does'nt exists"})
      }
  }
  else{
  		res.status(400).send({message:"Please provide the required parameters to login."})
  }
}



module.exports = {
  addSalesPerson,
  allSales,
  getCustomerLocation,
  oneSalesDetail,
  sendOTPLoginSales,
  salesLogin
}
