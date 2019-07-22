const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SaleSchema = new Schema({
	name:{
		type: String,
		required:true
	},
	email:{
		type: String
	},
  password:{
		type: String
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
		required:true
	},
	city:{
		type: String,
		required:true
	},
	// pincode:{
	// 	type: Number,
	// },
  stock_count:{
    type: Number
  },
	is_active: {
      type: Number,
      default:1,
			required:true
  },
	is_loggedin: {
      type: Number,
      default:0,
			required:true
  },
});

module.exports = Sale = mongoose.model("sales", SaleSchema);
