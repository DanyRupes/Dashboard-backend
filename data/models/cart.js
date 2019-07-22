const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartSchema = new Schema({
  customer_id:{
		type: String,
    required: true
	},
  is_ordered:{
		type: Number,
		default:0
	},
	is_active: {
      type: Number,
      default: 1
  },
});

module.exports = Cart = mongoose.model("cart", CartSchema)
