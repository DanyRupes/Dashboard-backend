const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new Schema({
	name:{
		type: String,
	  required: true
	},
	image_url:{
		type: String,
    required: true
	},
	desc:{
		type: String,
    required: true
	},
  stock:{
		type: String,
    required: true
	},
  price:{
		type: String,
    required: true
	},
  is_active:{
		type: Number,
    default:1
	}
});

module.exports = Product = mongoose.model("product", ProductSchema);
