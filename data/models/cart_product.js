const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartProductSchema = new Schema({
  cart_id:{
		type: String,
    required: true
	},
  order_id:{
    type: String
  },
  product_id:{
		type: String,
    required: true
	},
  quantity:{
    type: String
  },
  price:{
    type: Number
  },
	is_active: {
      type: Number,
      default: 1
  },
  is_reordered: {
      type: Number,
      default: 0
  },
});

module.exports = CartProduct = mongoose.model("cart_product", CartProductSchema)
