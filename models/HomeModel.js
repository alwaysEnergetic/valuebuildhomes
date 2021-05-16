var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HomeSchema = new Schema({
	title: {type: String, required: true},
	desc:{type:String},
	size: {type: Number},
	beds: {type: Number},
    baths: {type: Number},
    garage: {type: Number},
    baseprice: {type: Number},
    options:{type: String},
	subdesigns:{type: String},
}, {timestamps: true});

module.exports = mongoose.model("Home", HomeSchema);