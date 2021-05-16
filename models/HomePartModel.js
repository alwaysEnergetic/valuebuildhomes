var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HomePartSchema = new Schema({
	title: {type: String, required: true}
}, {timestamps: false});

module.exports = mongoose.model("HomePart", HomePartSchema);