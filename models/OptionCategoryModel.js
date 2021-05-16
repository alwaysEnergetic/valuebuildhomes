var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OptionCategorySchema = new Schema({
	title: {type: String, required: true}
}, {timestamps: false});

module.exports = mongoose.model("OptionCategory", OptionCategorySchema);