var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var LandQuestionSchema = new Schema({
	title: {type: String, required: true},
	parent: {type:String,default:0 },
	check: {type: Boolean, required: true, default:true},
	amount: {type: Boolean, required:true, default:false},
}, {timestamps: true});

module.exports = mongoose.model("LandQuestion", LandQuestionSchema);