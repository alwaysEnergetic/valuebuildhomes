var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PartSchema = new Schema({
	part: {type: String, required: true},
    category:{type:String,}
}, {timestamps: false});

module.exports = mongoose.model("Part", PartSchema);