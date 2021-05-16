var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OptionSchema = new Schema({
	title: {type: String, required: true},
    category:{type:String, required:true},
    type:{type:String},
	desc:{type:String},
    check:{type:Boolean},
    price:{type:Number},
    unit:{type:String},
    help_img:{type:String},
    help_desc:{type:String},
    select:{type:Number},
    number:{type:Number},
    selections:{type:String}
}, {timestamps: true});

module.exports = mongoose.model("Option", OptionSchema);