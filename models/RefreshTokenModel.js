var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RefreshTokenSchema = new Schema({
    userid:{type: String},
	user: {},
	token: {type: String},
	createdAt:{type:Date, expires:'720h'}
}, {timestamps: true});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);