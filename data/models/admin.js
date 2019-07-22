const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdminSchema = new Schema({
	name:{
		type: String,
	  required: true
	},
	email:{
		type: String,
    required: true
	},
	password:{
		type: String,
    required: true
	},
  is_active:{
		type: Number,
    default:1
	},
	is_admin:{
		type: Number,
    default:0
	}
});

module.exports = Admin = mongoose.model("admin", AdminSchema);
