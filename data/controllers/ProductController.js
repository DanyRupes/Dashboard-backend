var jwt = require('jsonwebtoken');
var secret = require('../../config/key').secretOrKey

const Admin = require('./../models/admin');
const Product = require('./../models/product');
const Location = require('./../models/location');
const Sale = require('./../models/sales');
const ProductLocation = require('./../models/product_location');
const SalesProduct = require('./../models/sales_product');

// Add new product and map the product to all location available.
const addProduct = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    let checkProduct = await Product.findOne({name:req.query.name,is_active:1})
    if (!checkProduct) {
      let newProduct = await Product.create({name:req.query.name,image_url:req.file.path,desc:req.query.desc,stock:req.query.stock,price:req.query.price})
      if (newProduct) {
        let getLoc = await Location.find({is_active:1})
        let locationId = getLoc.map(x => x.id)
        let checkprodLoc = await ProductLocation.find({product_id:newProduct.id,location_id:locationId})
        if (checkprodLoc.length == 0) {
          let loopLocProd = await locationId.map(async(li) =>{
            let mapProdLoc = await ProductLocation.create({product_id:newProduct.id,location_id:li,stock_count:newProduct.stock})
            console.log(mapProdLoc)
          })
          await Promise.all(loopLocProd);
        }
        else{
          res.send({message:"This product is already available for the locations you have."})
        }
        res.send({details:newProduct})
      }
      else{
        res.send({message:"Problem in creating a product"})
      }
    }
    else{
        res.send({message:"Product is already available"})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// Edit product will allow you to edit only the stock.
const editProduct = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    let checkProduct = await Product.findOne({_id:req.query.productId,is_active:1})
    if (!checkProduct) {res.send({message:"No product available"})}
    let changeProduct = await Product.update({_id:req.query.productId},{$set:{stock:req.query.stock}})
    if (changeProduct) {
      let fetchProduct = await Product.findOne({_id:req.query.productId})
      res.send({details:fetchProduct})
    }
    else{
      res.send({error:"Problem in updating a product."})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// view all products with filter by location and search
const allProducts = async function(req,res){
  let getProduct;
  let getProdLoc;
  let getLoc;
  let checkLocation;
  let productId;
  let searchKey = req.query.searchKey
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.locationId) {
      checkLocation = await Location.findOne({_id:req.query.locationId,is_active:1})
      if (!checkLocation) {res.send({message:"Location not available"})}
      getProdLoc = await ProductLocation.find({location_id:req.query.locationId,is_available:1})
      productId = getProdLoc.map(x => x.product_id)
      if (req.query.searchKey) {
        getProduct = await Product.find({_id:productId,is_active:1,name: new RegExp(searchKey)})
      }
      else{
        getProduct = await Product.find({_id:productId,is_active:1})
      }
      let loopStart = await getProduct.map(async(li)=>{
        getProdLoc = await ProductLocation.find({product_id:li.id,location_id:req.query.locationId,is_available:1})
        // let locationId = getProdLoc.map(x => x.location_id)
        let stockCount = getProdLoc.map(x=> x.stock_count)
        getLoc = await Location.find({_id:req.query.locationId,is_active:1},{is_active:0})
        let stockLoop = await stockCount.map(async(st) =>{
          getLoc.map(x => x._doc['stockCount'] = st)
        })
        await Promise.all(stockLoop);
        li._doc['location'] = getLoc
      })
      await Promise.all(loopStart)
      res.send({details:getProduct})
    }
    else{
      if (req.query.searchKey) {
        getProduct = await Product.find({is_active:1,name: new RegExp(searchKey)})
      }
      else{
        getProduct = await Product.find({is_active:1})
      }
      // getProduct = await Product.find({is_active:1})
      let loopStart = await getProduct.map(async(li)=>{
        getProdLoc = await ProductLocation.find({product_id:li.id,is_available:1})
        let locationId = getProdLoc.map(x => x.location_id)
        let stockCount = getProdLoc.map(x=> x.stock_count)
        getLoc = await Location.find({_id:locationId,is_active:1},{is_active:0})
        let stockLoop = await stockCount.map(async(st) =>{
          getLoc.map(x => x._doc['stockCount'] = st)
        })
        await Promise.all(stockLoop);
        li._doc['location'] = getLoc
      })
      await Promise.all(loopStart)
      res.send({details:getProduct})
    }
  }
  else{
    res.send("please send token")
  }
}

// view all Products and available cities
const allProduct = async function(req,res){
  let arrLoc = []
  let getLoc;
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    let getProduct = await Product.find({is_active:1})
    let loopStart = await getProduct.map(async(li)=>{
      let getProdLoc = await ProductLocation.find({product_id:li.id,is_available:1})
      let locationId = getProdLoc.map(x => x.location_id)
      let stockCount = getProdLoc.map(x=> x.stock_count)
      getLoc = await Location.find({_id:locationId,is_active:1},{is_active:0})
      let stockLoop = await stockCount.map(async(st) =>{
        getLoc.map(x => x._doc['stockCount'] = st)
      })
      await Promise.all(stockLoop);
      li._doc['location'] = getLoc
    })
    await Promise.all(loopStart)
    res.send({details:getProduct})
  }
  else if (req.query.salesId) {
    // Here comes product list for sales
    let checkSales = await Sale.findOne({_id:req.query.salesId})
    if (checkSales) {
      let getLocation = await Location.findOne({place:checkSales.place})
      // res.send(getLocation)
      let getProduct = await Product.find({is_active:1})
      let loopStarted = await getProduct.map(async(li)=>{
       let getProdLoc = await ProductLocation.find({product_id:li.id,location_id:getLocation.id,is_available:1})
       let locationId = getProdLoc.map(x => x.location_id)
       let getLoc = await Location.find({_id:locationId,is_active:1},{is_active:0})
       li._doc['location'] = getLoc
      })
     await Promise.all(loopStarted)
     res.send({details:getProduct})
    }
    else{
      res.send({message:"No sales available"})
    }
  }
  else{
    res.send({message:"Please login."})
  }
}

// View all Product by its location
const prodlist = async function(req,res){
  console.log('in function')
  console.log(req)
  if (req.query.locationId) {
    let checkLocation = await Location.findOne({_id:req.query.locationId,is_active:1})
    if (!checkLocation) {res.send({message:"Location not available"})}
    let getProdLoc = await ProductLocation.find({location_id:req.query.locationId,is_available:1})
    let productId = getProdLoc.map(x => x.product_id)
    let getProduct = await Product.find({_id:productId,is_active:1})
    if (getProduct) {
        res.send({details:getProduct})
    }
    else{
      res.send({message:"Product not available"})
    }
  }
  else{
    res.send({message:"Please provide locationId"})
  }
}

const allProductbyLocation = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    let result = await prodlist(req,res)
    console.log(result)
  }
  else if (req.query.phoneno) {
    //
  }
  else{
    res.send({message:"Please login."})
  }
}

// view one product details
const oneProduct = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.productId) {
      let getProduct = await Product.findOne({_id:req.query.productId,is_active:1})
      res.send({details:getProduct})
    }
    else{
      res.send({message:"Please send productId."})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// Remove product from one location
const removeProduct = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.locationId && req.query.productId) {
      let checkprodLoc = await ProductLocation.remove({product_id:req.query.productId,location_id:req.query.locationId,is_available:1})
      console.log(checkprodLoc)
      res.send({message:"Product removed for your location."})
    }
    else{
      res.send({message:"Provide locationId and productId."})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// Delete the Product and delete mapped product
const deleteProduct = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.productId) {
      let checkProduct = await Product.findOne({_id:req.query.productId,is_active:1})
      if (!checkProduct) {res.send({message:"Product not available."})}
      let inactiveProduct = await Product.updateOne({_id:req.query.productId},{$set:{is_active:0}})
      let removeProdLoc = await ProductLocation.remove({product_id:req.query.productId,is_available:1})
      res.send({message:"Product Deleted"})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// Assign products to sales
const assignProducts = async function(req,res){
  let productId;
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.locationId) {
      let checkLocation = await Location.findOne({_id:req.query.locationId,is_active:1})
      console.log(checkLocation)
      // return
      if (req.query.salesId) {
        let checkSales = await Sale.findOne({_id:req.query.salesId,place:checkLocation.place,is_active:1})
        if (!checkSales) {res.send({message:"Sales person is not avialbale"})}
        productId = req.query.productId
        if (productId.length > 0) {
          productId = productId.split(',')
        }
        console.log(productId)
        let idLoop = await productId.map(async(li) => {
          let checkSalesProduct = await SalesProduct.find({sales_id:req.query.salesId,product_id:li,is_active:1})
          if (checkSalesProduct.length == 0) {
            let mapSalesProduct = await SalesProduct.create({sales_id:req.query.salesId,product_id:li,stock_assigned:req.query.stockAssigned})
          }
          else{
            res.send({message:"Already mapped you cannot create, go and edit."})
          }
        })
        await Promise.all(idLoop);
        res.send({message:'Product assigned',details:checkSales})
      }
    }
    else{
      res.send({message:"Please select location."})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// After assigned products update the stock count for products.
const updateStockCount = async function(req,res){
  if (req.headers.token) {
    let verifyAdmin = await jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({_id:verifyAdmin.id,is_active:1})
    if (!checkAdmin) {res.send({error:"You are not allowed to view this."})}
    if (req.query.locationId && req.query.productId) {
      let checkProdLoc = await ProductLocation.findOne({location_id:req.query.locationId,product_id:req.query.productId,is_available:1})
      console.log('checkProdLoc')
      console.log(checkProdLoc)
      if (checkProdLoc) {
        let updateStock = await ProductLocation.updateOne({product_id:checkProdLoc.product_id},{$set:{stock_count:req.query.stockCount}})
        console.log('updateStock')
        console.log(updateStock)
        if (updateStock) {
          let getStockCount = await ProductLocation.findOne({product_id:req.query.productId},{stock_count:1})
          let fetchProduct = await Product.findOne({_id:req.query.productId})
          console.log('fetchProduct')
          console.log(fetchProduct)
          fetchProduct._doc['stockCount'] = getStockCount.stock_count
          res.send({message:"Stock count is updated",details:fetchProduct})
        }
      }
      else{
        res.send({message:"This product is not available in this location"})
      }
    }
    else{
      res.send({message:"Please provide location and product."})
    }
  }
  else{
    res.send({message:"Please provide token."})
  }
}

// View Assigned products from sales
const assignedStockProducts = async function(req,res){
  if (req.query.salesId) {
    let verifySales = await Sale.findOne({_id:req.query.salesId,is_active:1,is_loggedin:1})
    if (!verifySales) {res.send({message:"No sales available in this Id."})}
    let getSalesProduct = await SalesProduct.find({sales_id:verifySales.id,is_active:1})
    let stockAssigned = getSalesProduct.map(x => x.stock_assigned)
    let productId = getSalesProduct.map(x => x.product_id)
    let fetchProduct = await Product.find({_id:productId,is_active:1})
    let loopStart = await fetchProduct.map(async(li) => {
      let innerLoop = await getSalesProduct.map(async(st) => {
        if (st.product_id === li.id) {
          console.log(st)
          li._doc['stock_assigned'] = st.stock_assigned
        }
      })
      await Promise.all(innerLoop)
    })
    await Promise.all(loopStart)
    console.log(fetchProduct)
    res.send({details:fetchProduct})
  }
  else{
    res.send({message:"Please provide sales Id."})
  }
}


module.exports = {
  addProduct,
  editProduct,
  allProduct,
  allProducts,//with filter and search
  allProductbyLocation,
  oneProduct,
  removeProduct,
  deleteProduct,
  assignProducts,
  updateStockCount,
  assignedStockProducts
}
