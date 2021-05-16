var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SubHomeSchema = new Schema({
	title: {type: String, required: true},
    main_img: {type: String, required: true},
    description:{type:String},
	size: {type: Number},
	beds: {type: Number},
    baths: {type: Number},
    garage: {type: Number},
    price: {type: Number},
    images:[],
    styles:[],
    options:[]
}, {timestamps: true});

module.exports = mongoose.model("Home", SubHomeSchema);