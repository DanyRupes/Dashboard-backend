const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SalesProductSchema = new Schema({
  sales_id:{
		type: String,
    required: true
	},
  product_id:{
		type: String,
    required: true
	},
  stock_assigned:{
    type: String,
    required: true
  },
  delivered_count:{
    type: Number,
    // required: true
  },
	is_active: {
      type: Number,
      default: 1
  },
});

module.exports = SalesProduct = mongoose.model("sales_product", SalesProductSchema)
