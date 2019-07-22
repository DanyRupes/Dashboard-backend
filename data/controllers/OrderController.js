var jwt = require('jsonwebtoken');
var secret = require('../../config/key').secretOrKey

const Admin = require('./../models/admin');
const Order = require('./../models/orders');
const Product = require('./../models/product');
const Location = require('./../models/location');
const Sale = require('./../models/sales');
const Customer = require('./../models/customer');
const Cart = require('./../models/cart');
const CartProduct = require('./../models/cart_product');
const ProductLocation = require('./../models/product_location');
const SalesProduct = require('./../models/sales_product');
const SalesCustomer = require('./../models/sales_customer');

// Admin to create an order
const addOrder = async function(req,res){
  let productId;
  let quantity;
  let placeorder;
  let addtocart;
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.locationId && req.query.productId) {
      productId = req.query.productId
      if (productId.length > 0) {
        productId = productId.split(',')
      }
      quantity = req.query.quantity
      if (quantity.length > 0) {
        quantity = quantity.split(',')
      }
      console.log(req.query.productId)
      let checkProdLoc = await ProductLocation.find({product_id:productId,location_id:req.query.locationId,is_available:1})
      if (req.query.customerId) {
        let checkCustomer = await Customer.findOne({_id:req.query.customerId,is_active:1})
        let getCustCart = await Cart.findOne({customer_id:req.query.customerId,is_active:1})
        let checkCart = await CartProduct.find({cart_id:getCustCart.id,product_id:productId,is_active:1})
        let getSales = await SalesCustomer.findOne({customer_id:req.query.customerId,is_assigned:1})
        if (checkCart.length == 0) {
          //add items to cart
          let idLoop = await productId.map(async(li,pdkey) => {
            let qtLoop = await quantity.map(async(qu,qtkey) =>{
              if (pdkey === qtkey) {
                console.log(li,qu)
                addtocart = await CartProduct.create(({cart_id:getCustCart.id,product_id:li,quantity:qu}))
              }
            })
            await Promise.all(qtLoop);
          })
          await Promise.all(idLoop);
          let fetchCartProduct = await CartProduct.find({cart_id:getCustCart.id,is_active:1})
          placeorder = await Order.create({
            cart_id:getCustCart.id,
            schedule_date:req.query.scheduleDate,
            // schedule_time:req.query.scheduleTime,
            sales_id:getSales.sales_id,
            status: "Assigned",
            created_by:"Admin"
          })
          if (placeorder) {
            let updateCart = await Cart.updateOne({customer_id:req.query.customerId},{$set:{is_ordered:1}})
            let updateCartProd = await CartProduct.updateOne({cart_id:getCustCart.id},{$set:{order_id:placeorder.id}})
            console.log('in update')
          }
          let getProduct = await Product.find({_id:productId,is_active:1})
          //get product quantity customer entered.
          let prodLoop = await getProduct.map(async(pd) => {
            let fetchCartProduct = await CartProduct.findOne({product_id:pd.id,is_active:1})
            pd._doc['quantity'] = fetchCartProduct.quantity
          })
          await Promise.all(prodLoop);
          let getSalesName = await Sale.findOne({_id:getSales.sales_id})
          placeorder._doc['salesPerson'] = getSalesName.name
          placeorder._doc['Phoneno'] = getSalesName.phoneno
          placeorder._doc['products'] = getProduct
          placeorder._doc['customer'] = checkCustomer
          console.log(placeorder)
          res.send({details:placeorder})
        }
        else{
          res.send({message:"This product is already in cart."})
        }
      }
      else{
        res.send({message:"Please select a customer to make an order."})
      }
    }
    else{
      res.send({message:"Please select location or you have missed productId"})
    }
  }
  else if (req.query.phoneno) {
    console.log('in sales')
    // Sales to add order
    let checkSales = await Sale.findOne({phoneno:req.query.phoneno,is_active:1})
    if (!checkSales) {res.send({error:"You are not allowed to view this."})}
    if (req.query.productId) {
      productId = req.query.productId
      if (productId.length > 0) {
        productId = productId.split(',')
      }
      quantity = req.query.quantity
      if (quantity.length > 0) {
        quantity = quantity.split(',')
      }
      console.log(req.query.productId)
      if (req.query.customerId) {
        let getCustCart = await Cart.findOne({customer_id:req.query.customerId,is_active:1})
        let checkCart = await CartProduct.find({cart_id:getCustCart.id,product_id:productId,is_active:1})
        if (checkCart.length == 0) {
          let idLoop = await productId.map(async(li) => {
              addtocart = await CartProduct.create({cart_id:getCustCart.id,product_id:li})
          })
          // await Promise.all(quantityLoop);
          await Promise.all(idLoop);
          placeorder = await Order.create({
            cart_id:getCustCart.id,
            schedule_date:req.query.scheduleDate,
            schedule_time:req.query.scheduleTime,
            sales_id:checkSales.id,
            status: "Assigned",
            created_by:"SalesPerson"
          })
          console.log('placeorder')
          console.log(placeorder)
          if (placeorder) {
            let updateCart = await Cart.updateOne({customer_id:req.query.customerId},{$set:{is_ordered:1}})
            let updateCartProd = await CartProduct.updateOne({cart_id:updateCart.id},{$set:{order_id:placeorder.id}})
          }
          // Get SAles detail
          let mapSalesCustomer;
          let getSales = await SalesCustomer.findOne({sales_id:checkSales.id,customer_id:req.query.customerId,is_assigned:1})
          if(!getSales){
            mapSalesCustomer = await SalesCustomer.create({sales_id:checkSales.id,customer_id:req.query.customerId,is_assigned:1})
          }
          let getProduct = await Product.find({_id:productId,is_active:1})
          let getSalesName = await Sale.findOne({_id:mapSalesCustomer.sales_id})
          placeorder._doc['salesPerson'] = getSalesName.name
          placeorder._doc['Phoneno'] = getSalesName.phoneno
          placeorder._doc['products'] = getProduct
          console.log(placeorder)
          res.send({details:placeorder})
        }
        else{
          res.send({message:"This product is already in cart."})
        }
      }
      else{
        res.send({message:"Please select a customer to make an order."})
      }
    }
    else{
        res.send({message:"Please selct the product."})
    }
  }
  else{
    res.send({message:"Please provide token or phoneno"})
  }
}

// Add Order from customer
const customerAddOrder = async function(req,res){
  let productId;
  let quantity;
  let addtocart;
  let updatetocart;
  let placeorder;
  if (req.query.customerId) {
    let checkCustomer = await Customer.findOne({_id:req.query.customerId,is_active:1})
    if(!checkCustomer) {res.send({message:"No customer available"})}
    let checkLocation = await Location.findOne({place:checkCustomer.place,is_active:1})
    if (checkLocation) {
      if (req.query.productId) {
        productId = req.query.productId
        if (productId.length > 0) {
          productId = productId.split(',')
        }
        quantity = req.query.quantity
        if (quantity.length > 0) {
          quantity = quantity.split(',')
        }
        let checkProdLoc = await ProductLocation.find({product_id:productId,location_id:checkLocation.id,is_available:1})
        let getCustCart = await Cart.findOne({customer_id:req.query.customerId,is_active:1})
        let checkCart = await CartProduct.find({cart_id:getCustCart.id,product_id:productId,is_active:1})
        let getSales = await SalesCustomer.findOne({customer_id:req.query.customerId,is_assigned:1})
        if (checkCart.length == 0) {
          //add items to cart
          let idLoop = await productId.map(async(li,pdkey) => {
            let qtLoop = await quantity.map(async(qu,qtkey) =>{
              if (pdkey === qtkey) {
                console.log(li,qu)
                addtocart = await CartProduct.create(({cart_id:getCustCart.id,product_id:li,quantity:qu}))
              }
            })
            await Promise.all(qtLoop);
          })
          await Promise.all(idLoop);
          let fetchCartProduct = await CartProduct.find({cart_id:getCustCart.id,is_active:1})
          placeorder = await Order.create({
            cart_id:getCustCart.id,
            schedule_date:req.query.scheduleDate,
            // schedule_time:req.query.scheduleTime,
            sales_id:getSales.sales_id,
            status: "Assigned",
            created_by:"Customer"
          })
          if (placeorder) {
            let updateCart = await Cart.updateOne({customer_id:req.query.customerId},{$set:{is_ordered:1}})
            let updateCartProd = await CartProduct.updateOne({cart_id:getCustCart.id},{$set:{order_id:placeorder.id}})
          }
          let getProduct = await Product.find({_id:productId,is_active:1})
          //get product quantity customer entered.
          let prodLoop = await getProduct.map(async(pd) => {
            let fetchCartProduct = await CartProduct.findOne({product_id:pd.id,is_active:1})
            pd._doc['quantity'] = fetchCartProduct.quantity
          })
          await Promise.all(prodLoop);
          let getSalesName = await Sale.findOne({_id:getSales.sales_id})
          placeorder._doc['salesPerson'] = getSalesName.name
          placeorder._doc['Phoneno'] = getSalesName.phoneno
          placeorder._doc['products'] = getProduct
          placeorder._doc['customer'] = checkCustomer
          console.log(placeorder)
          res.send({details:placeorder})
        }
        else{
          res.send({message:"This product is already in cart."})
        }
      }
      else{
        res.send({message:"Please provide productId"})
      }
    }
    else{
      res.send({message:"Location not found"})
    }
  }
  else{
    res.send({message:"Please provide customerId"})
  }
}

// Re-order an order that already ordererd by customer.
//While reordering that order should be delivered.
const reOrder = async function(req,res){
  let updateCart;
  if (req.query.customerId) {
    let checkCustomer = await Customer.findOne({_id:req.query.customerId,is_active:1})
    if (!checkCustomer) {res.send({message:"Customer not available."})}
    let getCustCart = await Cart.findOne({customer_id:req.query.customerId,is_active:1})
    // let checkCart = await CartProduct.find({cart_id:getCustCart.id,product_id:productId,is_active:1})
    if (req.query.orderId) {
      let checkOrder = await Order.findOne({_id:req.query.orderId,is_active:1,cart_id:getCustCart.id})
      // console.log(checkOrder)
      // res.send(checkOrder)
      // return
      if (!checkOrder) {res.send({message:"There is no order availbale in this id."})}
      if (checkOrder.is_delivered == 1) {
        let reorderProduct = await Order.updateOne({_id:req.query.orderId},{$set:{is_reordered:1,is_delivered:0,is_otp_sent:0,is_otp_verify:0,reordered_by:"Customer",status:"Assigned"}})
        let fetchOrder = await Order.findOne({_id:req.query.orderId,is_active:1,is_reordered:1})
        if (fetchOrder) {
          updateCart = await Cart.updateOne({customer_id:req.query.customerId},{$set:{is_ordered:1}})
        }
        let getCart = await CartProduct.find({cart_id:updateCart.id,order_id:req.query.orderId,is_active:1})
        let productId = getCart.map(x => x.product_id)
        let getProduct = await Product.find({_id:productId,is_active:1})
        let getSalesName = await Sale.findOne({_id:fetchOrder.sales_id})
        fetchOrder._doc['salesPerson'] = getSalesName.name
        fetchOrder._doc['Phoneno'] = getSalesName.phoneno
        fetchOrder._doc['products'] = getProduct
        console.log(fetchOrder)
        res.send({details:fetchOrder})
      }
      else{
        res.send({message:"Sorry,You cannot reorder the product which is in progress."})
      }
    }
    else{
      res.send({message:"Select your order to reorder."})
    }
  }
  else{
    res.send({message:"Please provide customerId"})
  }
}

// Once order is created from sales, a message will sent to customer phoneno and along with a OTP will be send to customer phoneno.
const sendOtpCustomerVerify = async function(req,res){
  if (req.query.salesId) {
    let checkSales = await Sale.findOne({_id:req.query.salesId,is_active:1})
    if (checkSales) {
      if (req.query.customerphno) {
        let checkCustomer = await Customer.findOne({phoneno:req.query.customerphno,is_active:1})
        if (!checkCustomer) {res.send({message:"Number does not available."})}
        let getOrder = await Order.findOne({_id:req.query.orderId,cart_id:checkCustomer.cart_id,is_active:1,created_by:"SalesPerson"})
        const sendOtp = new SendOtp(authKey);
        let sendOtptoCustomer = await sendOtp.send(req.query.customerphno, 611332, async function(err, data){
          if (err) {
            res.send(err)
          }
          else if (data.type == 'success') {
            console.log(data)
            let updateStatus = await Order.updateOne({_id:getOrder.id},{$set:{is_otp_sent:1}})
            res.send({message:"OTP has send to your number."})
          }
          else{
            res.send({message:data.message})
          }
        });
      }
      else{
        res.send({message:"Please provide customer Phoneno."})
      }
    }
    else {
      res.send({message:"There is no sales person available in this id."})
    }
  }
  else{
    res.send({message:"Please provide sales person id to continue."})
  }
}

// Once the otp sent verify it and generate a bill and collect the payment.
const generateBill = async function(req,res){
  if (req.query.salesId) {
    let checkSales = await Sale.findOne({_id:req.query.salesId,is_active:1})
    if (checkSales) {
      if (req.query.customerphno && req.query.otp) {
        let checkCustomer = await Customer.findOne({phoneno:req.query.customerphno,is_active:1})
        if (!checkCustomer) {res.send({message:"Number does not available."})}
        let getOrder = await Order.findOne({_id:req.query.orderId,cart_id:checkCustomer.cart_id,is_active:1,created_by:"SalesPerson",is_otp_sent:1})
        const sendOtp = new SendOtp(authKey);
        let verifyOtp = await sendOtp.verify(req.query.customerphno, req.query.otp, async function(err, data){
            if (err) {
              console.log(err)
            }
            else if (data.type === "success") {
              let updateStatus = await Order.updateOne({_id:getOrder.id},{$set:{is_otp_verify:1}})
              let newBill = await Bill.create({sales_id:checkSales.id,customer_id:checkCustomer.id,order_id:getOrder.id})
              if (newBill) {
                res.send({message:"Your order is verified and your bill details is here.",details:newBill})
              }
              else{
                res.send({message:"Something went wrong."})
              }
              res.send({message:"Login success"})
            }
        });
      }
      else{
        res.send({message:"Please provide customer phoneno and its otp to verify your order."})
      }
    }
    else {
      res.send({message:"There is no sales person available in this id."})
    }
  }
  else{
    res.send({message:"Please provide sales person id to continue."})
  }
}

// View Order from Admim and sales
const allOrders = async function(req,res){
  let getOrders;
  let cartId;
  let getCartProd;
  let productId;
  let getProducts;
  if (req.headers.token) {
    // Admin Order List
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.locationId) {
        // Filter by location
        let getLoc = await Location.findOne({_id:req.query.locationId,is_active:1})
        let getCustomer = await Customer.find({place:getLoc.place,city:getLoc.city})
        let getCartId = await Cart.find({customer_id:getCustomer.map(x => x.id)})
        getOrders = await Order.find({cart_id:getCartId.map(x=>x.id),is_active:1})
        let orderLoop = await getOrders.map(async(li) =>{
          let fetchCart = await Cart.findOne({_id:li.cart_id})
          let fetchCustomer = await Customer.findOne({_id:fetchCart.customer_id,is_active:1})
          let fetchSales = await Sale.findOne({_id:li.sales_id,is_active:1})
          getCartProd = await CartProduct.find({cart_id:fetchCart.id,is_active:1})
          productId = getCartProd.map(x => x.product_id)
          getProducts = await Product.find({_id:productId,is_active:1})
          //get product quantity customer entered.
          let prodLoop = await getProducts.map(async(pd) => {
            let fetchCartProduct = await CartProduct.findOne({product_id:pd.id,is_active:1})
            pd._doc['quantity'] = fetchCartProduct.quantity
          })
          li._doc['salesName'] = fetchSales.name
          li._doc['customerName'] = fetchCustomer.name
          li._doc['customerPlace'] = fetchCustomer.place
          li._doc['customerPhoneno'] = fetchCustomer.phoneno
          li._doc['products'] = getProducts
        })
        await Promise.all(orderLoop);
        res.send({details:getOrders})
    }
    else{
      getOrders = await Order.find({is_active:1})
      let orderLoop = await getOrders.map(async(li) =>{
        let fetchCart = await Cart.findOne({_id:li.cart_id})
        let fetchCustomer = await Customer.findOne({_id:fetchCart.customer_id,is_active:1})
        let fetchSales = await Sale.findOne({_id:li.sales_id,is_active:1})
        getCartProd = await CartProduct.find({cart_id:fetchCart.id,is_active:1})
        productId = getCartProd.map(x => x.product_id)
        getProducts = await Product.find({_id:productId,is_active:1})
        //get product quantity customer entered.
        let prodLoop = await getProducts.map(async(pd) => {
          console.log('in pd loop')
          let fetchCartProduct = await CartProduct.findOne({product_id:pd.id,is_active:1})
          pd._doc['quantity'] = fetchCartProduct.quantity
        })
        li._doc['salesName'] = fetchSales.name
        li._doc['customerName'] = fetchCustomer.name
        li._doc['customerPlace'] = fetchCustomer.place
        li._doc['customerPhoneno'] = fetchCustomer.phoneno
        li._doc['products'] = getProducts
      })
      await Promise.all(orderLoop);
      res.send({details:getOrders})
    }
  }
  else if (req.query.phoneno) {
    // Sales Order List
    let checkSales = await Sale.findOne({phoneno:req.query.phoneno,is_active:1})
    if (!checkSales) {res.send({error:"You are not allowed to view this."})}
    getOrders = await Order.find({sales_id:checkSales.id,is_active:1})
    cartId = getOrders.map(x => x.cart_id)
    getCartProd = await CartProduct.find({cart_id:cartId,is_active:1})
    productId = getCartProd.map(x => x.product_id)
    getProducts = await Product.find({_id:productId,is_active:1})
    // getOrders.push(getProducts)
    getOrders.map(x => x._doc['products'] = getProducts)
    console.log(getOrders)
    res.send({details:getOrders})
  }
  else if (req.query.customerId) {
    // Customer Order List
    let checkCustomer = await Customer.findOne({_id:req.query.customerId,is_active:1})
    if (!checkCustomer) {res.send({error:"You are not allowed to view this."})}
    let getCartId = await Cart.findOne({customer_id:req.query.customerId})
    getOrders = await Order.find({cart_id:getCartId.id,is_active:1})
    let salesId = getOrders.map(x => x.sales_id)
    let fetchSales = await Sale.findOne({_id:salesId,is_active:1})
    cartId = getOrders.map(x => x.cart_id)
    getCartProd = await CartProduct.find({cart_id:cartId,is_active:1})
    productId = getCartProd.map(x => x.product_id)
    getProducts = await Product.find({_id:productId,is_active:1})
    //get product quantity customer entered.
    let prodLoop = await getProducts.map(async(pd) => {
      console.log('in pd loop')
      let fetchCartProduct = await CartProduct.findOne({product_id:pd.id,is_active:1})
      pd._doc['quantity'] = fetchCartProduct.quantity
    })
    await Promise.all(prodLoop)
    console.log(getProducts)
    getOrders.map(x => x._doc['salesName'] = fetchSales.name)
    getOrders.map(x => x._doc['customer'] = checkCustomer)
    getOrders.map(x => x._doc['products'] = getProducts)
    console.log(getOrders)
    res.send({details:getOrders})
  }
  else{
    res.send({message:"Please provide token or phoneno or customerId."})
  }
}

// View one order and its bills as follows
const getOrderDetail = async function(req,res){
  if (req.headers.token) {
    // Admin Order List
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    getOrders = await Order.find({is_active:1})
  }
  else if (req.query.phoneno) {
    // Sales Order List
    let checkSales = await Sale.findOne({phoneno:req.query.phoneno,is_active:1})
    if (!checkSales) {res.send({error:"You are not allowed to view this."})}
    getOrders = await Order.find({sales_id:checkSales.id,is_active:1})
  }
  else if (req.query.customerId) {
    // Customer Order List
    let checkCustomer = await Customer.findOne({_id:req.query.customerId,is_active:1})
    if (!checkCustomer) {res.send({error:"You are not allowed to view this."})}
    let getCartId = await Cart.findOne({customer_id:req.query.customerId})
    getOrders = await Order.find({cart_id:getCartId.id,is_active:1})
  }
}

module.exports = {
  addOrder,
  customerAddOrder,
  reOrder,
  sendOtpCustomerVerify,
  generateBill,
  allOrders,
}
