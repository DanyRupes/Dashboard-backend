const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
	cart_id:{
		type: String,
    required:true
	},
	schedule_date:{
		type: String,
    required:true
	},
	// schedule_time:{
	// 	type:String,
	// 	required:true
	// },
  sales_id:{
		type: String,
	},
	payment_type:{
		type: String,
		// required:true
	},
	payed_amount:{
		type: String,
    // required: true
	},
  balance:{
		type: String,
    // required: true
	},
  status:{
		type: String,
    // required: true
	},
	is_delivered: {
      type: Number,
      default: 0
  },
	is_reordered:{
		type: Number,
		default:0
	},
	is_active: {
      type: Number,
      default: 1
  },
	is_otp_sent: {
      type: Number,
      default: 0
  },
	is_otp_verify: {
      type: Number,
      default: 0
  },
	created_by:{
		type:String,
		required:true
	},
	reordered_by:{
		type:String,
	},
	created_at:{
		type:Date,
		required:true,
		default: Date.now()
	},
	updated_at:{
		type:Date,
		required:true,
		default: Date.now()
	},
});

module.exports = Order = mongoose.model("orders", OrderSchema)
