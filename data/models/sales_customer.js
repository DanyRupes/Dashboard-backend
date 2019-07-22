const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SalesCustomerSchema = new Schema({
  sales_id:{
		type: String,
    required: true
	},
  customer_id:{
		type: String,
    required: true
	},
  is_assigned:{
    type: Number,
    default:0
  },
	is_active: {
      type: Number,
      default: 1
  },
});

module.exports = SalesCustomer = mongoose.model("sales_customer", SalesCustomerSchema)
