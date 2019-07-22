const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LocationSchema = new Schema({
	place:{
		type: String,
	  required: true
	},
	city:{
		type: String,
    required: true
	},
	pincode:{
		type: String,
    // required: true
	},
  is_active:{
		type: Number,
    default:1
	}
});

module.exports = Location = mongoose.model("location", LocationSchema);
