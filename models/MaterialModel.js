var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var MaterialSchema = new Schema({
	colorname: {type: String, required: true},
    color:{type:String},
    material:{type:String}
}, {timestamps: false});

module.exports = mongoose.model("Material", MaterialSchema);