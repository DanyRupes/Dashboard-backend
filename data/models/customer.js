const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CustomerSchema = new Schema({
	name:{
		type: String,
    required:true
	},
	email:{
		type: String,
    required:true
	},
	password:{
		type:String,
		// required:true
	},
  image_url:{
		type: String,
	},
	phoneno:{
		type: String,
		required:true
	},
	address:{
		type: String,
    required: true
	},
  place:{
		type: String,
    required: true
	},
  city:{
		type: String,
    required: true
	},
  pincode:{
		type: Number,
	},
	is_active: {
      type: Number,
      default: 1
  },
});

module.exports = Customer = mongoose.model("customers", CustomerSchema)
