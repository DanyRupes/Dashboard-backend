const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductLocationSchema = new Schema({
	product_id:{
		type: String,
	  required: true
	},
	location_id:{
		type: String,
    required: true
	},
	stock_count:{
		type: Number,
    // required: true
	},
  is_available:{
		type: Number,
    default:1
	}
});

module.exports = ProductLocation = mongoose.model("product_location", ProductLocationSchema);
