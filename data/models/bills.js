const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BillSchema = new Schema({
	sales_id:{
		type: String,
    required: true
	},
	customer_id:{
		type: String,
    required: true
	},
	order_id:{
		type: String,
    required: true
	},
	cash_collected:{
		type: Number,
		default:0,
		required: true
	},
	how_much:{
		type: String
	},
	is_active: {
      type: Number,
      default:1,
			required:true
  }
});

module.exports = Bill = mongoose.model("bills", BillSchema);
