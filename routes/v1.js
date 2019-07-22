const express = require('express');
const router = express.Router();

// Image Upload
var multer = require('multer');
var upload = multer({ dest: './public/images/' });
var uploadProduct = multer({ dest: './public/images/product/'});

// Import the controllers
const AdminController = require('../data/controllers/AdminController');
const LocationController = require('../data/controllers/LocationController');
const ProductController = require('../data/controllers/ProductController');
const SalesController = require('../data/controllers/SalesController');
const CustomerController = require('../data/controllers/CustomerController');
const OrderController = require('../data/controllers/OrderController');

// Set routes
// Admin
console.log('router is working')
router.post('/adminSignup',AdminController.adminSignup)
router.post('/adminLogin',AdminController.adminLogin)
router.get('/adminAuthStatus',AdminController.adminAuthStatus)

// Location
router.post('/addLocation',LocationController.addLocation)
router.get('/viewLocation',LocationController.viewLocation)
router.get('/getLocation',LocationController.getLocation)

// Product
router.post('/addProduct',uploadProduct.single('image_url'),ProductController.addProduct)
router.put('/editProduct',ProductController.editProduct)
router.get('/allProduct',ProductController.allProduct)
router.get('/allProducts',ProductController.allProducts)//with search and filter
router.get('/allProductbyLocation',ProductController.allProductbyLocation)
router.get('/oneProduct',ProductController.oneProduct)
router.delete('/removeProduct',ProductController.removeProduct)
router.delete('/deleteProduct',ProductController.deleteProduct)
router.post('/assignProducts',ProductController.assignProducts)
router.put('/updateStockCount',ProductController.updateStockCount)
router.get('/assignedStockProducts',ProductController.assignedStockProducts)

// Sales
router.post('/addSalesPerson',SalesController.addSalesPerson)
router.get('/allSales',SalesController.allSales)
router.get('/getCustomerLocation',SalesController.getCustomerLocation)
router.get('/oneSalesDetail',SalesController.oneSalesDetail)
router.post('/sendOTPLoginSales',SalesController.sendOTPLoginSales)
router.post('/salesLogin',SalesController.salesLogin)

// Customer
router.post('/addCustomer',CustomerController.addCustomer)
router.get('/allCustomer',CustomerController.allCustomer)
router.get('/oneCustomer',CustomerController.oneCustomer)
router.put('/setPassword',CustomerController.setPassword)
router.post('/sendOTPLoginCustomer',CustomerController.sendOTPLoginCustomer)
router.post('/customerLogin',CustomerController.customerLogin)

// Orders
router.post('/addOrder',OrderController.addOrder)
router.post('/customerAddOrder',OrderController.customerAddOrder)
router.put('/reOrder',OrderController.reOrder)
router.get('/allOrders',OrderController.allOrders)


module.exports = router;
