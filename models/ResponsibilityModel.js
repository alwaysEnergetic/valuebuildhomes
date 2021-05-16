var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ResponsibilitySchema = new Schema({
    category:{type:String,required:true},
	title: {type: String, required: true},
    subtitle:{type:String},
	range: {type: String}
}, {timestamps: true});

module.exports = mongoose.model("Responsibility", ResponsibilitySchema);