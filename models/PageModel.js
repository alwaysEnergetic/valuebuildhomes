var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PageSchema = new Schema({
	pageName: {type: String},
    pageContents:{}
}, {timestamps: false});

module.exports = mongoose.model("Page", PageSchema);