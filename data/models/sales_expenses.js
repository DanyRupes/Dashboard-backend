const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SalesExpenseSchema = new Schema({
	sales_id:{
		type: String,
	  required: true
	},
  image_url:{
    type: String,
  },
	expense_title:{
		type: String,
    required: true
	},
  desc:{
		type: String,
	},
  amount:{
    type: Number,
    required: true
  },
  is_active:{
		type: Number,
    default:1
	}
});

module.exports = SalesExpense = mongoose.model("sales_expenses", SalesExpenseSchema);
